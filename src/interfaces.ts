export interface HopTransaction {
  transactionHash: string
  chainId: number
  timestamp: number
}

export interface HopTransfer {
  transferId: string
  sender: string // address of the sender
  recipient: string // address of the recipient
  amount: string // number string with up to 4 decimals (e.g. '12.5423')
  tokenAddress: string // the address of the transferred token (on the source chain)
  executionDuration: number // time it took to complete the transfer in milliseconds (can be computed by comparing transaction timestamps)
  sourceTransaction: HopTransaction
  destinationTransaction: HopTransaction
}

/**
 * ERC20 Token
 * @see {@link https://github.com/hop-protocol/subgraph/blob/master/L1_Bridge_schema.graphql#L402-L417}
 */
export interface HopGraphqToken {
  id: string
  name: string
  address: string
}

/**
 * Hop TX
 * @see {@link https://github.com/hop-protocol/subgraph/blob/master/L1_Bridge_schema.graphql#L371-L400}
 */
export interface HopGraphqTransaction {
  from: string
  hash: string
}

/**
 * Hop TX
 * @see {@link https://github.com/hop-protocol/subgraph/blob/master/L1_Bridge_schema.graphql#L324-L369}
 */
export interface HopGraphqBlock {
  timestamp: string
}

export interface HopTransferSentResponse {
  id: string
  transferId: string
  sourceChainId: number
  destinationChainId: string
  recipient: string
  amount: string
  deadline: string
  block: HopGraphqBlock
  transaction: HopGraphqTransaction
  tokenEntity: HopGraphqToken
}

export interface HopwithdrawalBondedResponse {
  id: string
  transferId: string
  transactionHash: string
  amount: string
  block: HopGraphqBlock
  transaction: HopGraphqTransaction
}
