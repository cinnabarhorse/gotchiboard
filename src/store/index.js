import Vue from 'vue'
import Vuex from 'vuex'
import { utils } from 'ethers'
import { DateTime } from 'luxon'
import axios from 'axios'
import subgraph from '../utils/subgraph'
import transforms from '../utils/transforms'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    gotchiverseLaunchDate: transforms.gotchiverseLaunchDate,
    addressSpendData: [],
    leaderboardData: {
      alchemica: {
        week: {},
        month: {}
      }
    },
    competitionData: {
      alchemica: {
        1: [
          {
            timeFrom: 1673827200,
            timePeriod: 'week',
            dayModifiers: [1.6, 1.5, 1.4, 1.3, 1.2, 1.1, 1],
            ghstPayouts: [4860, 2880, 1800, 1440, 1260, 882, 702, 522, 432, 342, 342, 342, 342, 342, 342, 234, 234, 234, 234, 234, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
            data: {}
          },
          {
            timeFrom: 1674432000,
            timePeriod: 'week',
            dayModifiers: [1, 1, 1, 1, 1, 1, 1],
            ghstPayouts: [4860, 2880, 1800, 1440, 1260, 882, 702, 522, 432, 342, 342, 342, 342, 342, 342, 234, 234, 234, 234, 234, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
            data: {}
          },
          {
            timeFrom: 1675036800,
            timePeriod: 'week',
            dayModifiers: [1, 1.1, 1.2, 1.3, 1.2, 1.1, 1],
            ghstPayouts: [4860, 2880, 1800, 1440, 1260, 882, 702, 522, 432, 342, 342, 342, 342, 342, 342, 234, 234, 234, 234, 234, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
            data: {}
          },
          {
            timeFrom: 1675641600,
            timePeriod: 'week',
            dayModifiers: [1.3, 1.2, 1.1, 1, 1.1, 1.2, 1.3],
            ghstPayouts: [4860, 2880, 1800, 1440, 1260, 882, 702, 522, 432, 342, 342, 342, 342, 342, 342, 234, 234, 234, 234, 234, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
            data: {}
          }
        ]
      }
    }
  },
  getters: {
    leaderboardAlchemica: (state) => (timePeriod, timeFrom) => {
      if (state.leaderboardData.alchemica[timePeriod][timeFrom]) {
        return Object.keys(state.leaderboardData.alchemica[timePeriod][timeFrom]).map((address) => {
          return {
            address,
            ...state.leaderboardData.alchemica[timePeriod][timeFrom][address]
          }
        })
      }
      return []
    },
    competitionAlchemica: (state) => (season, round) => {
      if (state.competitionData.alchemica[season][round - 1].data) {
        return Object.keys(state.competitionData.alchemica[season][round - 1].data).map((address) => {
          return {
            address,
            ...state.competitionData.alchemica[season][round - 1].data[address]
          }
        })
      }
      return []
    },
    leaderboardAlchemicaStats: (state, getters) => (timePeriod, timeFrom) => {
      const numOfAddresses = getters.leaderboardAlchemica(timePeriod, timeFrom).length
      let tilesMinted = 0
      let installationsMinted = 0
      let totalFud = 0
      let totalFomo = 0
      let totalAlpha = 0
      let totalKek = 0

      getters.leaderboardAlchemica(timePeriod, timeFrom).forEach(address => {
        tilesMinted += address.tilesMinted
        installationsMinted += address.installationsMinted
        totalFud += address.totalFud
        totalFomo += address.totalFomo
        totalAlpha += address.totalAlpha
        totalKek += address.totalKek
      })

      return {
        numOfAddresses,
        tilesMinted,
        installationsMinted,
        totalFud,
        totalFomo,
        totalAlpha,
        totalKek
      }
    },
    competitionAlchemicaStats: (state, getters) => (season, round) => {
      const numOfAddresses = getters.competitionAlchemica(season, round).length
      let tilesMinted = 0
      let installationsMinted = 0
      let totalFud = 0
      let totalFomo = 0
      let totalAlpha = 0
      let totalKek = 0
      let totalFudModified = 0
      let totalFomoModified = 0
      let totalAlphaModified = 0
      let totalKekModified = 0

      getters.competitionAlchemica(season, round).forEach(address => {
        tilesMinted += address.tilesMinted
        installationsMinted += address.installationsMinted
        totalFud += address.totalFud
        totalFomo += address.totalFomo
        totalAlpha += address.totalAlpha
        totalKek += address.totalKek
        totalFudModified += address.totalFudModified
        totalFomoModified += address.totalFomoModified
        totalAlphaModified += address.totalAlphaModified
        totalKekModified += address.totalKekModified
      })

      return {
        numOfAddresses,
        tilesMinted,
        installationsMinted,
        totalFud,
        totalFomo,
        totalAlpha,
        totalKek,
        totalFudModified,
        totalFomoModified,
        totalAlphaModified,
        totalKekModified
      }
    },
    timeFromOptions: (state) => (timePeriod) => {
      return transforms.gotchiverseTimeFroms(timePeriod).map((timeFrom) => {
        return {
          label: `${timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)} starting ${DateTime.fromSeconds(timeFrom, { zone: 'utc' }).toISODate()}`,
          value: timeFrom
        }
      })
    }
  },
  mutations: {
  },
  actions: {
    async getLeaderboardAddressSpend (context, options) {
      // Only get data if it's not already in store
      const data = context.getters.leaderboardAlchemica(options.timePeriod, options.timeFrom)

      if (!data || !data.length) {
        let result
        try {
          const response = await axios.get(`/data/alchemica/${options.timePeriod}/${options.timeFrom}.json`)
          if (response?.data) result = response.data
        } catch (err) {
          // Do nothing
        }

        // If we couldn;t get it locally then get from subgraph
        if (!result) result = await transforms.alchemicaSpendByAddress(options)

        Vue.set(context.state.leaderboardData.alchemica[options.timePeriod], options.timeFrom, result)
      }
    },
    async getCompetitionAddressSpend (context, options) {
      // Only get data if it's not already in store
      const data = context.getters.competitionAlchemica(options.season, options.round)

      if (!data || !data.length) {
        let result
        try {
          const response = await axios.get(`/data/competitions/alchemica/${options.season}/${options.round}.json`)
          if (response?.data) result = response.data
        } catch (err) {
          // Do nothing
        }

        // If we couldn;t get it locally then get from subgraph
        if (!result) {
          result = await transforms.alchemicaSpendByAddress(context.state.competitionData.alchemica[options.season][options.round - 1])
        }

        Vue.set(context.state.competitionData.alchemica[options.season][options.round - 1], 'data', result)
      }
    },
    async getAddressAlchemicaSpend (context, options) {
      if (!options.timeFrom) throw new Error('options.timeFrom parameter missing')
      if (!options.timePeriod) throw new Error('options.timePeriod parameter missing')
      if (!options.owner) throw new Error('options.owner parameter missing')

      const timeFrom = Math.round(options.timeFrom)

      // Get timeTo value
      let timeTo = Math.round(DateTime.fromSeconds(timeFrom, { zone: 'utc' }).endOf(options.timePeriod).toSeconds())

      // If timeTo is in the future set to now
      if (timeTo > DateTime.utc().toSeconds()) timeTo = Math.round(DateTime.now().toSeconds())

      const tiles = await subgraph.mintTileEvents(timeFrom, timeTo, options.owner)
      const installations = await subgraph.mintInstallationEvents(timeFrom, timeTo, options.owner)

      return [...tiles, ...installations].map(x => {
        const type = x.tile ? 'tile' : 'installationType'
        const costFud = Number(utils.formatEther(x[type].alchemicaCost[0])) * x.quantity
        const costFomo = Number(utils.formatEther(x[type].alchemicaCost[1])) * x.quantity
        const costAlpha = Number(utils.formatEther(x[type].alchemicaCost[2])) * x.quantity
        const costKek = Number(utils.formatEther(x[type].alchemicaCost[3])) * x.quantity

        // Figure out multiplier
        const eventDateTime = DateTime.fromSeconds(Number(x.timestamp), { zone: 'utc' })
        let modifier = 1
        if (options.dayModifiers) {
          modifier = options.dayModifiers[eventDateTime.weekday - 1]
        }

        const costFudModified = (Number(utils.formatEther(x[type].alchemicaCost[0])) * x.quantity) * modifier
        const costFomoModified = (Number(utils.formatEther(x[type].alchemicaCost[1])) * x.quantity) * modifier
        const costAlphaModified = (Number(utils.formatEther(x[type].alchemicaCost[2])) * x.quantity) * modifier
        const costKekModified = (Number(utils.formatEther(x[type].alchemicaCost[3])) * x.quantity) * modifier

        return {
          eventId: x.id,
          timestamp: x.timestamp,
          quantity: x.quantity,
          id: x[type].id,
          name: x[type].name,
          type: type === 'tile' ? type : 'installation',
          costFud,
          costFomo,
          costAlpha,
          costKek,
          totalFud: Math.round(costFud + (costFomo * 2) + (costAlpha * 4) + (costKek * 10)),
          modifier,
          costFudModified,
          costFomoModified,
          costAlphaModified,
          costKekModified,
          totalFudModified: Math.round(costFudModified + (costFomoModified * 2) + (costAlphaModified * 4) + (costKekModified * 10))
        }
      }).sort((a, b) => b.timestamp - a.timestamp)
    },
    async getCompetitionAddressAlchemicaSpend (context, options) {
      if (!options.season) throw new Error('options.season parameter missing')
      if (!options.round) throw new Error('options.round parameter missing')

      if (!context.state.competitionData.alchemica?.[options.season]?.[options.round - 1]?.timeFrom) throw new Error(`Cannot find timeFrom for Alchemica Competition Season "${options.season}" Round "${options.round - 1}"`)

      return await context.dispatch('getAddressAlchemicaSpend', {
        timeFrom: context.state.competitionData.alchemica[options.season][options.round - 1].timeFrom,
        timePeriod: context.state.competitionData.alchemica[options.season][options.round - 1].timePeriod,
        dayModifiers: context.state.competitionData.alchemica[options.season][options.round - 1].dayModifiers,
        owner: options.owner
      })
    }
  },
  modules: {
  }
})
