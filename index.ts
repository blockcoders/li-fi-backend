import { loadHopTransfers } from './src'

async function bootstrap() {
  const transfers = await loadHopTransfers()

  // first one
  console.info('first one: ', transfers[0])

  // middle one
  console.info('middle one: ', transfers[Math.floor((transfers.length - 1) / 2)])

  // last one
  console.info('first one: ', transfers[transfers.length - 1])

  // filter transfer with a destinationTransaction
  const transfersWithDestinationTransaction = transfers.filter(
    (item) => item.destinationTransaction.transactionHash !== 'n/a',
  )

  // first one with a destinationTransaction
  console.info('first one with a destinationTransaction: ', transfersWithDestinationTransaction[0])

  // middle one with a destinationTransaction
  console.info(
    'middle one with a destinationTransaction: ',
    transfersWithDestinationTransaction[Math.floor((transfersWithDestinationTransaction.length - 1) / 2)],
  )

  // last one with a destinationTransaction
  console.info(
    'first one with a destinationTransaction: ',
    transfersWithDestinationTransaction[transfersWithDestinationTransaction.length - 1],
  )
}

bootstrap().catch(console.error)
