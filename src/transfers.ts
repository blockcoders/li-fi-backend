import { GraphQLClient } from 'graphql-request'
import toHex from 'to-hex'
import { HopTransfer, HopTransferSentResponse, HopwithdrawalBondedResponse } from './interfaces'
import { transferSentToL2SQuery, transferSentsQuery, withdrawalBondedsQuery } from './queries'

const hopSubgraph = 'https://api.thegraph.com/subgraphs/name/hop-protocol'
const limit = 1000
const chains: Record<string, number> = {
  mainnet: 1,
  optimism: 10,
  xdai: 77,
  polygon: 137,
  arbitrum: 42161,
}

/**
 * Get list of transfers to a destination chain
 * @param {string} chain
 * @param {number} offset
 * @returns {HopTransferSentResponse[]}
 */
export async function getMainnetTransfers(chain: string, offset = 0): Promise<HopTransferSentResponse[]> {
  const result: HopTransferSentResponse[] = []
  const client = new GraphQLClient(`${hopSubgraph}/hop-${chain}`)
  const query = chain === 'mainnet' ? transferSentToL2SQuery : transferSentsQuery
  const { transfers } = await client.request<{ transfers: HopTransferSentResponse[] }>(query, { limit, offset })

  console.info(`Got ${transfers.length} transfers from ${chain}.`)

  result.push(...(transfers ?? []))

  if (transfers.length === limit) {
    try {
      const next = await getMainnetTransfers(chain, offset + limit)

      result.push(...(next ?? []))
    } catch (err: any) {
      if (!err?.response?.errors) {
        throw err
      }
    }
  }

  return result.map((item) => ({
    ...item,
    // use id as transferId with mainnet transfers
    transferId: item.transferId || item.id,
    sourceChainId: chains[chain],
  }))
}

/**
 * Get list of transfers that were bonded at destination chain
 * @param {string} chain
 * @param {string[]} transferIds
 * @returns {HopwithdrawalBondedResponse[]}
 */
export async function getWithdrawalBondeds(
  chain: string,
  transferIds: string[],
): Promise<HopwithdrawalBondedResponse[]> {
  const client = new GraphQLClient(`${hopSubgraph}/hop-${chain}`)
  const { bondedsByTransferId, bondedsByTransactionHash } = await client.request<{
    bondedsByTransferId: HopwithdrawalBondedResponse[]
    bondedsByTransactionHash: HopwithdrawalBondedResponse[]
  }>(withdrawalBondedsQuery, { transferIds })

  const withdrews: HopwithdrawalBondedResponse[] = []
  withdrews.push(...bondedsByTransferId)
  withdrews.push(...bondedsByTransactionHash)

  console.info(`Got ${withdrews.length} withdrawal bondeds from ${chain}.`)

  return withdrews
}

/**
 * Loads all Hop transfers and stores them in a list
 * @returns {HopTransfer[]}
 */
export async function loadHopTransfers(): Promise<HopTransfer[]> {
  const chainNames = Object.keys(chains)
  const rawTransfers = await Promise.all(chainNames.map((chain) => getMainnetTransfers(chain)))
  const transfers = rawTransfers
    .flat()
    .sort((a, b) => parseInt(b.block.timestamp, 10) - parseInt(a.block.timestamp, 10))

  const transferIdChunks = transfers.reduce(
    (filtered: string[][], transfer: HopTransferSentResponse) => {
      if (transfer.transferId) {
        const transferId = transfer.transferId
        const currentIndex = filtered.length - 1

        if (filtered[currentIndex].length < limit) {
          filtered[currentIndex].push(toHex(transferId, { evenLength: true, addPrefix: true }))
        } else {
          filtered.push([toHex(transferId, { evenLength: true, addPrefix: true })])
        }
      }
      return filtered
    },
    [[]],
  )

  const withdrawalBondeds = await Promise.all(
    chainNames.map((chain) => {
      return Promise.all(transferIdChunks.map((transferIds) => getWithdrawalBondeds(chain, transferIds))).then((resp) =>
        resp.flat(),
      )
    }),
  ).then((resp) => resp.flat())

  const destinationTransfersMap = withdrawalBondeds.reduce(
    (filtered: Record<string, HopwithdrawalBondedResponse>, withdrawalBonded: HopwithdrawalBondedResponse) => {
      filtered[withdrawalBonded.transferId] = withdrawalBonded

      return filtered
    },
    {},
  )

  return transfers.map((transfer) => {
    const withdraw = destinationTransfersMap[transfer.transferId] ?? null
    const destinationTimestamp = parseInt(withdraw?.block?.timestamp ?? '0', 10)
    const sourceTimestamp = parseInt(transfer.block.timestamp, 10)

    return {
      transferId: transfer.transferId,
      sender: transfer.transaction.from,
      recipient: transfer.recipient,
      amount: transfer.amount,
      tokenAddress: transfer.tokenEntity.address,
      executionDuration: destinationTimestamp > 0 ? destinationTimestamp - sourceTimestamp : 0,
      sourceTransaction: {
        transactionHash: transfer.transaction.hash,
        chainId: transfer.sourceChainId,
        timestamp: sourceTimestamp,
      },
      destinationTransaction: {
        transactionHash: withdraw?.transaction?.hash ?? 'n/a',
        chainId: parseInt(transfer.destinationChainId, 10),
        timestamp: destinationTimestamp,
      },
    }
  })
}
