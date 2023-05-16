<template>
  <background-layout>
    <div class="w-lg mx-auto py-5">
      <router-link
        :to="{ path: '/competitions/alch-spending-season-2', query: { round: $route.query.round } }"
        class="flex mb-2 items-center">
        <img class="mt-1 mr-4" src="../../assets/chevron_left.svg" alt="">
        <span class="text-2xl hover:underline">Back to Alchemica Spending Season 2</span>
      </router-link>
      <bordered class="text-[40px] leading-none bg-white text-indigo py-2 px-3 inline-block mb-6">
        <a :href="`https://fireball.gg/client/${$route.params.address}/gotchis/owned`" target="_blank"
          class="hover:text-purple">
          {{ $route.params.address }}
        </a>
      </bordered>
      <div class="flex mb-8">
        <g-heading :level="'2'" :styleLevel="'1'" class="flex-1">
          Scoreboard
        </g-heading>
        <div class="flex">
          <switcher
            :options="[{label: 'Round 1', value: 1},{label: 'Round 2', value: 2},{label: 'Round 3', value: 3},{label: 'Round 4', value: 4}]"
            :disabled="loading"
            @input="changeRound"
            :value="round"/>
        </div>
      </div>
      <modifiers
        class="mb-4"
        :day-modifiers="competitionData[round - 1].dayModifiers"
        :token-modifiers="competitionData[round - 1].tokenModifiers"/>
      <div v-if="loading" class="py-10 text-4xl text-center">
        Loading...
      </div>
      <template v-else>
        <div class="flex mb-4">
          <g-heading :level="'4'" :styleLevel="'4'" class="text-white/50 leading-8 flex-1">
            Total stats
          </g-heading>
          <div class="flex">
            <div class="text-xl mr-2">Show with multipliers</div>
            <switcher
              :options="[{label: 'Yes', value: true},{label: 'No', value: false}]"
              small
              @input="showModified = $event"
              :value="showModified"/>
          </div>
        </div>
        <AlchemicaStats
          class="mb-7"
          :stats="spendingStats"
          :showModified="showModified" />
        <AlchemicaAddressTable
          class="mb-6"
          :data="data.slice(0, shownPlaces + 1)"
          :showModified="showModified" />
        <div v-if="shownPlaces < data.length" class="text-center">
          <g-button
            class="px-2.5 pt-1.5 pb-3"
            :theme="'primary'"
            @click.native="shownPlaces += 50">
            Load more
          </g-button>
        </div>
      </template>
    </div>
  </background-layout>
</template>

<script>
import { mapGetters } from 'vuex'

import AlchemicaStats from '@/components/leaderboards/alchemica/AlchemicaStats.vue'
import AlchemicaAddressTable from '@/components/leaderboards/alchemica/AlchemicaAddressTable.vue'
import Modifiers from '@/components/competitions/Modifiers.vue'

export default {
  components: {
    AlchemicaStats,
    AlchemicaAddressTable,
    Modifiers
  },
  data () {
    return {
      loading: true,
      season: 2,
      round: Number(this.$route.query.round) || 1,
      showModified: true,
      data: null,
      shownPlaces: 50
    }
  },
  computed: {
    ...mapGetters([
      'competitionAlchemica'
    ]),
    competitionData () {
      return this.$store.state.competitionData.alchemica[this.season]
    },
    spendingStats () {
      let tilesMinted = 0
      let installationsMinted = 0
      let itemsMinted = 0
      let totalFud = 0
      let totalFomo = 0
      let totalAlpha = 0
      let totalKek = 0
      let totalSpend = 0
      let totalFudModified = 0
      let totalFomoModified = 0
      let totalAlphaModified = 0
      let totalKekModified = 0
      let totalSpendModified = 0

      this.data.forEach(item => {
        if (item.type === 'tile') tilesMinted += item.quantity
        if (item.type === 'installation') installationsMinted += item.quantity
        if (item.type === 'item') itemsMinted += item.quantity
        totalFud += item.costFud
        totalFomo += item.costFomo
        totalAlpha += item.costAlpha
        totalKek += item.costKek
        totalSpend += item.totalFud
        totalFudModified += item.costFudModified
        totalFomoModified += item.costFomoModified
        totalAlphaModified += item.costAlphaModified
        totalKekModified += item.costKekModified
        totalSpendModified += item.totalFudModified
      })

      return {
        tilesMinted,
        installationsMinted,
        itemsMinted,
        totalFud,
        totalFomo,
        totalAlpha,
        totalKek,
        totalSpend,
        totalFudModified,
        totalFomoModified,
        totalAlphaModified,
        totalKekModified,
        totalSpendModified
      }
    }
  },
  methods: {
    async changeRound (e) {
      this.loading = true
      this.round = e

      // Sync router params if not already
      if (`${this.round}` !== this.$route.query.round) this.$router.push({ query: { round: this.round } })

      this.data = await this.$store.dispatch('getCompetitionAddressAlchemicaSpend', {
        season: this.season,
        round: this.round,
        owner: this.$route.params.address
      })
      this.loading = false
    },
    viewAddress (address) {
      if (address) {
        this.$router.push({
          path: `/competitions/alch-spending-season-2/${address}`,
          query: {
            round: this.round
          }
        })
      }
    }
  },
  async mounted () {
    try {
      await this.changeRound(this.round)
      this.loading = false
    } catch (e) {
      console.error(e)
    }
  }
}
</script>
