import { utils } from 'ethers'
import { DateTime } from 'luxon'
import subgraph from './subgraph.js'

const gotchiverseLaunchDate = 1652832000 // Wed May 18 2022 00:00:00 GMT+0000

export default {
  gotchiverseLaunchDate,
  gotchiverseTimeFroms: (timePeriod) => {
    const timeFroms = []
    const now = DateTime.utc()
    timeFroms.push(now.startOf(timePeriod).toSeconds())
    let i = 0
    do {
      const minusOption = timePeriod === 'week' ? { days: 7 * (i + 1) } : { months: (i + 1) }
      const date = now.minus(minusOption).startOf(timePeriod)
      timeFroms.push(date.toSeconds())
      i++
    } while (timeFroms[timeFroms.length - 1] > gotchiverseLaunchDate)

    return timeFroms
  },
  alchemicaSpendByAddress: async (options) => {
    if (!options.timeFrom) throw new Error('options.timeFrom parameter missing')
    if (!options.timePeriod) throw new Error('options.timePeriod parameter missing')

    const timeFrom = Math.round(options.timeFrom)

    // Get timeTo value
    let timeTo = Math.round(DateTime.fromSeconds(timeFrom, { zone: 'utc' }).endOf(options.timePeriod).toSeconds())

    // If timeTo is in the future set to now
    if (timeTo > DateTime.utc().toSeconds()) timeTo = Math.round(DateTime.now().toSeconds())

    const [tiles, installations, items] = await Promise.all([
      subgraph.mintTileEvents(timeFrom, timeTo),
      subgraph.mintInstallationEvents(timeFrom, timeTo),
      subgraph.getItemSpending(timeFrom, timeTo)
    ])

    const addressData = {}

    // Add alchemica spent on tiles by each address
    tiles.forEach((event) => {
      // Round to 1 decimal place
      const fudSpent = Math.round(Number(utils.formatEther(event.tile.alchemicaCost[0])) * 10) / 10
      const fomoSpent = Math.round(Number(utils.formatEther(event.tile.alchemicaCost[1])) * 10) / 10
      const alphaSpent = Math.round(Number(utils.formatEther(event.tile.alchemicaCost[2])) * 10) / 10
      const kekSpent = Math.round(Number(utils.formatEther(event.tile.alchemicaCost[3])) * 10) / 10

      const eventDateTime = DateTime.fromSeconds(Number(event.timestamp), { zone: 'utc' })

      let modifier = 1
      if (options.dayModifiers) {
        modifier = options.dayModifiers[eventDateTime.weekday - 1]
      }
      let tokenModifiers = { fud: 1, fomo: 1, alpha: 1, kek: 1 }
      if (options.tokenModifiers) tokenModifiers = options.tokenModifiers

      if (!addressData[event.owner]) {
        addressData[event.owner] = {
          tilesSpend: {
            fud: fudSpent * event.quantity,
            fomo: fomoSpent * event.quantity,
            alpha: alphaSpent * event.quantity,
            kek: kekSpent * event.quantity,
            fudModified: (fudSpent * modifier * tokenModifiers.fud) * event.quantity,
            fomoModified: (fomoSpent * modifier * tokenModifiers.fomo) * event.quantity,
            alphaModified: (alphaSpent * modifier * tokenModifiers.alpha) * event.quantity,
            kekModified: (kekSpent * modifier * tokenModifiers.kek) * event.quantity
          },
          tilesMinted: event.quantity,
          installationsSpend: {
            fud: 0,
            fomo: 0,
            alpha: 0,
            kek: 0,
            fudModified: 0,
            fomoModified: 0,
            alphaModified: 0,
            kekModified: 0
          },
          installationsMinted: 0,
          itemsSpend: {
            fud: 0,
            fomo: 0,
            alpha: 0,
            kek: 0,
            fudModified: 0,
            fomoModified: 0,
            alphaModified: 0,
            kekModified: 0
          },
          itemsMinted: 0
        }
      } else {
        addressData[event.owner].tilesSpend.fud += fudSpent * event.quantity
        addressData[event.owner].tilesSpend.fomo += fomoSpent * event.quantity
        addressData[event.owner].tilesSpend.alpha += alphaSpent * event.quantity
        addressData[event.owner].tilesSpend.kek += kekSpent * event.quantity
        addressData[event.owner].tilesSpend.fudModified += (fudSpent * modifier * tokenModifiers.fud) * event.quantity
        addressData[event.owner].tilesSpend.fomoModified += (fomoSpent * modifier * tokenModifiers.fomo) * event.quantity
        addressData[event.owner].tilesSpend.alphaModified += (alphaSpent * modifier * tokenModifiers.alpha) * event.quantity
        addressData[event.owner].tilesSpend.kekModified += (kekSpent * modifier * tokenModifiers.kek) * event.quantity
        addressData[event.owner].tilesMinted += event.quantity
      }
    })

    // Add alchemica spent on installations by each address
    installations.forEach((event) => {
      // Round to 1 decimal place
      const fudSpent = Math.round(Number(utils.formatEther(event.installationType.alchemicaCost[0])) * 10) / 10
      const fomoSpent = Math.round(Number(utils.formatEther(event.installationType.alchemicaCost[1])) * 10) / 10
      const alphaSpent = Math.round(Number(utils.formatEther(event.installationType.alchemicaCost[2])) * 10) / 10
      const kekSpent = Math.round(Number(utils.formatEther(event.installationType.alchemicaCost[3])) * 10) / 10

      const eventDateTime = DateTime.fromSeconds(Number(event.timestamp), { zone: 'utc' })

      let modifier = 1
      if (options.dayModifiers) {
        modifier = options.dayModifiers[eventDateTime.weekday - 1]
      }
      let tokenModifiers = { fud: 1, fomo: 1, alpha: 1, kek: 1 }
      if (options.tokenModifiers) tokenModifiers = options.tokenModifiers

      if (!addressData[event.owner]) {
        addressData[event.owner] = {
          tilesSpend: {
            fud: 0,
            fomo: 0,
            alpha: 0,
            kek: 0,
            fudModified: 0,
            fomoModified: 0,
            alphaModified: 0,
            kekModified: 0
          },
          tilesMinted: 0,
          installationsSpend: {
            fud: fudSpent * event.quantity,
            fomo: fomoSpent * event.quantity,
            alpha: alphaSpent * event.quantity,
            kek: kekSpent * event.quantity,
            fudModified: (fudSpent * modifier * tokenModifiers.fud) * event.quantity,
            fomoModified: (fomoSpent * modifier * tokenModifiers.fomo) * event.quantity,
            alphaModified: (alphaSpent * modifier * tokenModifiers.alpha) * event.quantity,
            kekModified: (kekSpent * modifier * tokenModifiers.kek) * event.quantity
          },
          installationsMinted: event.quantity,
          itemsSpend: {
            fud: 0,
            fomo: 0,
            alpha: 0,
            kek: 0,
            fudModified: 0,
            fomoModified: 0,
            alphaModified: 0,
            kekModified: 0
          },
          itemsMinted: 0
        }
      } else {
        addressData[event.owner].installationsSpend.fud += fudSpent * event.quantity
        addressData[event.owner].installationsSpend.fomo += fomoSpent * event.quantity
        addressData[event.owner].installationsSpend.alpha += alphaSpent * event.quantity
        addressData[event.owner].installationsSpend.kek += kekSpent * event.quantity
        addressData[event.owner].installationsSpend.fudModified += (fudSpent * modifier * tokenModifiers.fud) * event.quantity
        addressData[event.owner].installationsSpend.fomoModified += (fomoSpent * modifier * tokenModifiers.fomo) * event.quantity
        addressData[event.owner].installationsSpend.alphaModified += (alphaSpent * modifier * tokenModifiers.alpha) * event.quantity
        addressData[event.owner].installationsSpend.kekModified += (kekSpent * modifier * tokenModifiers.kek) * event.quantity
        addressData[event.owner].installationsMinted += event.quantity
      }
    })

    items.forEach((event) => {
      // Round to 1 decimal place
      const fudSpent = event.cost.FUD || 0
      const fomoSpent = event.cost.FOMO || 0
      const alphaSpent = event.cost.ALPHA || 0
      const kekSpent = event.cost.KEK || 0

      const eventDateTime = DateTime.fromSeconds(Number(event.timestamp), { zone: 'utc' })

      let modifier = 1
      if (options.dayModifiers) {
        modifier = options.dayModifiers[eventDateTime.weekday - 1]
      }
      let tokenModifiers = { fud: 1, fomo: 1, alpha: 1, kek: 1 }
      if (options.tokenModifiers) tokenModifiers = options.tokenModifiers

      if (!addressData[event.address]) {
        addressData[event.address] = {
          tilesSpend: {
            fud: 0,
            fomo: 0,
            alpha: 0,
            kek: 0,
            fudModified: 0,
            fomoModified: 0,
            alphaModified: 0,
            kekModified: 0
          },
          tilesMinted: 0,
          installationsSpend: {
            fud: 0,
            fomo: 0,
            alpha: 0,
            kek: 0,
            fudModified: 0,
            fomoModified: 0,
            alphaModified: 0,
            kekModified: 0
          },
          installationsMinted: 0,
          itemsSpend: {
            fud: fudSpent * event.quantity,
            fomo: fomoSpent * event.quantity,
            alpha: alphaSpent * event.quantity,
            kek: kekSpent * event.quantity,
            fudModified: (fudSpent * modifier * tokenModifiers.fud) * event.quantity,
            fomoModified: (fomoSpent * modifier * tokenModifiers.fomo) * event.quantity,
            alphaModified: (alphaSpent * modifier * tokenModifiers.alpha) * event.quantity,
            kekModified: (kekSpent * modifier * tokenModifiers.kek) * event.quantity
          },
          itemsMinted: event.quantity
        }
      } else {
        addressData[event.address].itemsSpend.fud += fudSpent * event.quantity
        addressData[event.address].itemsSpend.fomo += fomoSpent * event.quantity
        addressData[event.address].itemsSpend.alpha += alphaSpent * event.quantity
        addressData[event.address].itemsSpend.kek += kekSpent * event.quantity
        addressData[event.address].itemsSpend.fudModified += (fudSpent * modifier * tokenModifiers.fud) * event.quantity
        addressData[event.address].itemsSpend.fomoModified += (fomoSpent * modifier * tokenModifiers.fomo) * event.quantity
        addressData[event.address].itemsSpend.alphaModified += (alphaSpent * modifier * tokenModifiers.alpha) * event.quantity
        addressData[event.address].itemsSpend.kekModified += (kekSpent * modifier * tokenModifiers.kek) * event.quantity
        addressData[event.address].itemsMinted += event.quantity
      }
    })

    // Calculate FUD standard spent by each address
    for (const address in addressData) {
      addressData[address].totalFud = addressData[address].installationsSpend.fud + addressData[address].tilesSpend.fud + addressData[address].itemsSpend.fud
      addressData[address].totalFomo = addressData[address].installationsSpend.fomo + addressData[address].tilesSpend.fomo + addressData[address].itemsSpend.fomo
      addressData[address].totalAlpha = addressData[address].installationsSpend.alpha + addressData[address].tilesSpend.alpha + addressData[address].itemsSpend.alpha
      addressData[address].totalKek = addressData[address].installationsSpend.kek + addressData[address].tilesSpend.kek + addressData[address].itemsSpend.kek
      addressData[address].fudStandardSpent = addressData[address].totalFud + (addressData[address].totalFomo * 2) + (addressData[address].totalAlpha * 4) + (addressData[address].totalKek * 10)

      // Modified values
      addressData[address].totalFudModified = addressData[address].installationsSpend.fudModified + addressData[address].tilesSpend.fudModified + addressData[address].itemsSpend.fudModified
      addressData[address].totalFomoModified = addressData[address].installationsSpend.fomoModified + addressData[address].tilesSpend.fomoModified + addressData[address].itemsSpend.fomoModified
      addressData[address].totalAlphaModified = addressData[address].installationsSpend.alphaModified + addressData[address].tilesSpend.alphaModified + addressData[address].itemsSpend.alphaModified
      addressData[address].totalKekModified = addressData[address].installationsSpend.kekModified + addressData[address].tilesSpend.kekModified + addressData[address].itemsSpend.kekModified
      addressData[address].fudStandardSpentModified = addressData[address].totalFudModified + (addressData[address].totalFomoModified * 2) + (addressData[address].totalAlphaModified * 4) + (addressData[address].totalKekModified * 10)
    }

    const ensNames = await subgraph.getENS(Object.keys(addressData))

    ensNames.forEach(x => {
      if (addressData[x.owner.id]) {
        addressData[x.owner.id].ens = x.name
      }
    })

    return addressData
  },
  competitionAlchemicaData: {
    1: [
      {
        timeFrom: 1673827200,
        timePeriod: 'week',
        dayModifiers: [1.6, 1.5, 1.4, 1.3, 1.2, 1.1, 1],
        tokenModifiers: { fud: 1, fomo: 1, alpha: 1, kek: 1 },
        ghstPayouts: [4860, 2880, 1800, 1440, 1260, 882, 702, 522, 432, 342, 342, 342, 342, 342, 342, 234, 234, 234, 234, 234, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
        data: {}
      },
      {
        timeFrom: 1674432000,
        timePeriod: 'week',
        dayModifiers: [1, 1, 1, 1, 1, 1, 1],
        tokenModifiers: { fud: 1, fomo: 1, alpha: 1, kek: 1 },
        ghstPayouts: [4860, 2880, 1800, 1440, 1260, 882, 702, 522, 432, 342, 342, 342, 342, 342, 342, 234, 234, 234, 234, 234, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
        data: {}
      },
      {
        timeFrom: 1675036800,
        timePeriod: 'week',
        dayModifiers: [1, 1.1, 1.2, 1.3, 1.2, 1.1, 1],
        tokenModifiers: { fud: 1, fomo: 1, alpha: 1, kek: 1 },
        ghstPayouts: [4860, 2880, 1800, 1440, 1260, 882, 702, 522, 432, 342, 342, 342, 342, 342, 342, 234, 234, 234, 234, 234, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
        data: {}
      },
      {
        timeFrom: 1675641600,
        timePeriod: 'week',
        dayModifiers: [1.3, 1.2, 1.1, 1, 1.1, 1.2, 1.3],
        tokenModifiers: { fud: 1, fomo: 1, alpha: 1, kek: 1 },
        ghstPayouts: [4860, 2880, 1800, 1440, 1260, 882, 702, 522, 432, 342, 342, 342, 342, 342, 342, 234, 234, 234, 234, 234, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
        data: {}
      }
    ],
    2: [
      {
        timeFrom: 1682899200,
        timePeriod: 'week',
        dayModifiers: [1.6, 1.5, 1.4, 1.3, 1.2, 1.1, 1],
        tokenModifiers: { fud: 2, fomo: 1, alpha: 1, kek: 1 },
        ghstPayouts: [4860, 2880, 1800, 1440, 1260, 882, 702, 522, 432, 342, 342, 342, 342, 342, 342, 234, 234, 234, 234, 234, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
        data: {}
      },
      {
        timeFrom: 1683504000,
        timePeriod: 'week',
        dayModifiers: [1.6, 1.5, 1.4, 1.3, 1.2, 1.1, 1],
        tokenModifiers: { fud: 1, fomo: 2, alpha: 1, kek: 1 },
        ghstPayouts: [4860, 2880, 1800, 1440, 1260, 882, 702, 522, 432, 342, 342, 342, 342, 342, 342, 234, 234, 234, 234, 234, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
        data: {}
      },
      {
        timeFrom: 1684108800,
        timePeriod: 'week',
        dayModifiers: [1.6, 1.5, 1.4, 1.3, 1.2, 1.1, 1],
        tokenModifiers: { fud: 1, fomo: 1, alpha: 2, kek: 1 },
        ghstPayouts: [4860, 2880, 1800, 1440, 1260, 882, 702, 522, 432, 342, 342, 342, 342, 342, 342, 234, 234, 234, 234, 234, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
        data: {}
      },
      {
        timeFrom: 1684713600,
        timePeriod: 'week',
        dayModifiers: [1.6, 1.5, 1.4, 1.3, 1.2, 1.1, 1],
        tokenModifiers: { fud: 1, fomo: 1, alpha: 1, kek: 2 },
        ghstPayouts: [4860, 2880, 1800, 1440, 1260, 882, 702, 522, 432, 342, 342, 342, 342, 342, 342, 234, 234, 234, 234, 234, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
        data: {}
      }
    ],
    3: [
      {
        timeFrom: 1693180800,
        timePeriod: 'week',
        dayModifiers: [1.8, 1.6, 1.4, 1.3, 1.2, 1.1, 1],
        tokenModifiers: { fud: 1, fomo: 1, alpha: 1, kek: 1 },
        ghstPayouts: [6900, 4050, 2550, 1950, 1650, 1170, 870, 570, 390, 300, 300, 300, 300, 300, 300, 210, 210, 210, 210, 210, 180, 180, 180, 180, 180, 150, 150, 150, 150, 150, 135, 135, 135, 135, 135, 120, 120, 120, 120, 120, 84, 84, 84, 84, 84, 84, 84, 84, 84, 84, 72, 72, 72, 72, 72, 72, 72, 72, 72, 72, 66, 66, 66, 66, 66, 66, 66, 66, 66, 66, 66, 66, 66, 66, 66, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63],
        data: {}
      },
      {
        timeFrom: 1693785600,
        timePeriod: 'week',
        dayModifiers: [1.8, 1.6, 1.4, 1.3, 1.2, 1.1, 1],
        tokenModifiers: { fud: 1, fomo: 1, alpha: 1, kek: 1 },
        ghstPayouts: [6900, 4050, 2550, 1950, 1650, 1170, 870, 570, 390, 300, 300, 300, 300, 300, 300, 210, 210, 210, 210, 210, 180, 180, 180, 180, 180, 150, 150, 150, 150, 150, 135, 135, 135, 135, 135, 120, 120, 120, 120, 120, 84, 84, 84, 84, 84, 84, 84, 84, 84, 84, 72, 72, 72, 72, 72, 72, 72, 72, 72, 72, 66, 66, 66, 66, 66, 66, 66, 66, 66, 66, 66, 66, 66, 66, 66, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63],
        data: {}
      }
    ]
  }
}
