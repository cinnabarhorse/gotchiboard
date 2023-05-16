import axios from 'axios'

const mintTileEvents = async (timeFrom, timeTo, owner) => {
  let results = []
  let numOfResults = 0
  let lastId = ''
  do {
    const response = await axios.post('https://api.thegraph.com/subgraphs/name/aavegotchi/gotchiverse-matic', JSON.stringify({
      query: `{
        mintTileEvents(first: 1000, where: {${timeFrom ? `timestamp_gt:${timeFrom}, ` : ''}${timeTo ? `timestamp_lt:${timeTo}, ` : ''}${owner ? `owner:"${owner}", ` : ''}id_gt: "${lastId}"}) {
          id
          block
          timestamp
          owner
          quantity
          tile {
            id
            tileType
            alchemicaCost
            name
          }
        }
      }`
    }))

    if (response?.data?.data?.mintTileEvents.length) {
      results = [...results, ...response.data.data.mintTileEvents]

      lastId = response.data.data.mintTileEvents[response.data.data.mintTileEvents.length - 1].id

      numOfResults = response.data.data.mintTileEvents.length
    } else {
      numOfResults = 0
    }
  } while (numOfResults)

  return results
}

const mintInstallationEvents = async (timeFrom, timeTo, owner) => {
  let results = []
  let numOfResults = 0
  let lastId = ''
  do {
    const response = await axios.post('https://api.thegraph.com/subgraphs/name/aavegotchi/gotchiverse-matic', JSON.stringify({
      query: `{
        mintInstallationEvents(first: 1000, where: {${timeFrom ? `timestamp_gt:${timeFrom}, ` : ''}${timeTo ? `timestamp_lt:${timeTo}, ` : ''}${owner ? `owner:"${owner}", ` : ''}id_gt: "${lastId}"}) {
          id
          block
          timestamp
          owner
          quantity
          installationType {
            id
            level
            installationType
            alchemicaCost
            name
          }
        }
      }`
    }))

    if (response?.data?.data?.mintInstallationEvents.length) {
      results = [...results, ...response.data.data.mintInstallationEvents]

      lastId = response.data.data.mintInstallationEvents[response.data.data.mintInstallationEvents.length - 1].id

      numOfResults = response.data.data.mintInstallationEvents.length
    } else {
      numOfResults = 0
    }
  } while (numOfResults)

  return results
}

const getItemSpending = async (timeFrom, timeTo, owner) => {
  const params = {
    used: true
  }
  if (timeFrom) params.startTime = timeFrom * 1000
  if (timeTo) params.endTime = timeTo * 1000
  if (owner) params.address = owner
  let results = []

  const response = await axios.get('https://api.gotchiverse.io/realm/item-store/purchases', { params })

  if (response?.data?.purchases.length) {
    results = response.data.purchases
  }

  // Convert timestamp to seconds
  return results.map((val) => ({ ...val, timestamp: Math.floor(val.timestamp / 1000) }))
}

const getENS = async (accounts) => {
  accounts = accounts?.length ? accounts.map((val) => `"${val}"`) : []
  let results = []
  let numOfResults = 0
  let lastId = ''

  // Graph can't handle large amounts of post data so split into chunks of 200
  const chunks = []
  while (accounts.length > 0) {
    chunks.push(accounts.splice(0, 400))
  }

  for (const chunk of chunks) {
    do {
      const response = await axios.post('https://api.thegraph.com/subgraphs/name/ensdomains/ens', JSON.stringify({
        query: `{
          domains${chunk.length > 0 ? `(where:{owner_:{id_in:[${chunk}]}, id_gt: "${lastId}"})` : ''} {
            id
            name
            owner {
              id
            }
          }
        }`
      }))

      if (response?.data?.data?.domains.length) {
        results = [...results, ...response.data.data.domains]

        lastId = response.data.data.domains[response.data.data.domains.length - 1].id

        numOfResults = response.data.data.domains.length
      } else {
        numOfResults = 0
      }
    } while (numOfResults)
  }

  return results
}

export default {
  mintTileEvents,
  mintInstallationEvents,
  getItemSpending,
  getENS
}
