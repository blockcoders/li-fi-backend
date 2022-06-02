import { gql } from 'graphql-request'

export const transferSentToL2SQuery = gql`
  query getTransferSentToL2S($limit: Int, $offset: Int) {
    transfers: transferSentToL2S(first: $limit, skip: $offset, orderBy: timestamp, orderDirection: desc) {
      id
      destinationChainId
      recipient
      amount
      block {
        timestamp
      }
      transaction {
        from
        hash
      }
      tokenEntity {
        address
      }
    }
  }
`

export const transferSentsQuery = gql`
  query getTransferSents($limit: Int, $offset: Int) {
    transfers: transferSents(first: $limit, skip: $offset, orderBy: timestamp, orderDirection: desc) {
      id
      transferId
      destinationChainId
      recipient
      amount
      block {
        timestamp
      }
      transaction {
        from
        hash
      }
      tokenEntity {
        address
      }
    }
  }
`

export const withdrawalBondedsQuery = gql`
  query getWithdrawalBondeds($transferIds: [String]) {
    bondedsByTransferId: withdrawalBondeds(where: { transferId_in: $transferIds }, orderBy: id, orderDirection: asc) {
      id
      transferId
      transactionHash
      amount
      block {
        timestamp
      }
      transaction {
        from
        hash
      }
    }
    bondedsByTransactionHash: withdrawalBondeds(
      where: { transactionHash_in: $transferIds }
      orderBy: id
      orderDirection: asc
    ) {
      id
      transferId
      transactionHash
      amount
      block {
        timestamp
      }
      transaction {
        from
        hash
      }
    }
  }
`
