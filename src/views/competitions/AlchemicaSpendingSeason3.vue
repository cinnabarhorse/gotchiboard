<template>
  <background-layout>
    <div class="w-lg mx-auto py-5">
      <router-link :to="'/competitions'" class="flex mb-2 items-center">
        <img class="mt-1 mr-4" src="../../assets/chevron_left.svg" alt="">
        <span class="text-2xl hover:underline">Back to competitions</span>
      </router-link>
      <bordered class="mb-8">
        <div class="border-4 border-gold bg-dark p-7 pb-6">
          <div class="flex">
            <div class="h-40 w-56 flex items-center mr-6">
              <img src="../../assets/comp3.png" alt="Alchemica spending season 1 logo"
                class="max-h-full max-w-full inline-block mb-2" />
            </div>
            <div class="flex-1">
              <h1 class="text-5xl mb-1">Alchemica Spending Season 3</h1>
              <div class="text-2xl leading-6 mb-1">
                <span class="text-white/50">Date: </span>
                August 28th 2023
              </div>
              <div class="text-2xl leading-6 mb-4 flex">
                <div class="text-white/50 mr-2">Prize pool: </div>
                <div class="flex justify-center items-center">
                  <img src="../../assets/ghst.png" alt="GHST logo" class="w-4 h-4 mt-1 mr-1">
                  <div>{{ Number(60000).toLocaleString() }}</div>
                </div>
              </div>
              <div
                class="flex cursor"
                @click="showRules = !showRules">
                <span class="text-2xl underline mr-2">{{ showRules ? 'Hide' : 'Show'}} rules</span>
                <img class="mt-1" src="../../assets/chevron_down.svg" alt="" />
              </div>
            </div>
          </div>
          <div v-if="showRules" class="mt-8 text-2xl">
            <p class="mb-4">
              Welcome frens, to the third Alchemica spending competition!
              <br />
              Climb the leaderboard by spending Alchemica in the Gotchiverse to win GHST prizes.
            </p>
            Please pay attention to the following rules:
            <ul class="list-disc list-inside mb-4">
              <li>The competition consists of 2 rounds</li>
              <li>Each round will last 1 week and run from UTC Monday 00:00:00 to Sunday 23:59:59</li>
              <li>Each round has a prizepool of 30k GHST</li>
              <li>The top 100 ranked in each round will win a prize as shown in the scoreboard</li>
              <li>Each round is ranked by "Total spend (in FUD)"</li>
              <ul class="list-[circle] list-inside ml-8">
                <li>This is the sum total amount of Alchemica spent in the round</li>
                <li>It is calculated using 10 FUD = 5 FOMO = 2.5 ALPHA = 1 KEK</li>
              </ul>
              <li>The following spending counts towards your Total spend:</li>
              <ul class="list-[circle] list-inside ml-8">
                <li>Crafting installations</li>
                <li>Crafting decorations</li>
                <li>Crafting tiles</li>
                <li>Upgrading installations</li>
              </ul>
              <li>Spending on installations only counts at the time of claiming (after craft time)</li>
              <li>Use max GLTR for spending to count instantly</li>
              <li>Each round has different time based multipliers</li>
              <li>Time your spending wisely to maximise your total spend each round!</li>
              <li>Prizes will be sent out ASAP after each round</li>
            </ul>
            Have fun and good luck frens!
          </div>
        </div>
      </bordered>
      <div class="flex mb-8">
        <g-heading :level="'2'" :styleLevel="'1'" class="flex-1">
          Scoreboard
        </g-heading>
        <div class="flex">
          <switcher
            :options="[{label: 'Round 1', value: 1},{label: 'Round 2', value: 2}]"
            :disabled="loading"
            @input="changeRound"
            :value="round"/>
        </div>
      </div>
      <div class="text-center text-2xl mb-2 tracking-wide">
        Round multipliers (UTC 00:00:00 - 23:59:59)
      </div>
      <table class="w-full text-2xl table-fixed mb-6">
        <thead class="text-white/50">
          <tr>
            <th class="font-normal">Monday</th>
            <th class="font-normal">Tuesday</th>
            <th class="font-normal">Wednesday</th>
            <th class="font-normal">Thursday</th>
            <th class="font-normal">Friday</th>
            <th class="font-normal">Saturday</th>
            <th class="font-normal">Sunday</th>
          </tr>
        </thead>
        <tbody class="text-center text-3xl">
          <tr>
            <td
              v-for="(multiplier, i) in competitionData[round - 1].dayModifiers" :key="i"
              class="pb-2">
              {{ multiplier }}x
            </td>
          </tr>
        </tbody>
      </table>
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
        <alchemica-stats
          class="mb-7"
          :stats="competitionAlchemicaStats(season, round)"
          :showModified="showModified"/>
        <div v-if="!leaderboardAlchemicaOrdered.length" class="py-10 text-4xl text-center">
          No spending yet...
        </div>
        <template v-else>
          <div class="flex mb-1 text-lg text-white/50">
            <div class="mr-4">Rank</div>
            <div class="flex-1">Address</div>
            <div class="w-37">Total spend (in FUD)</div>
            <div class="w-33 text-center">Prize</div>
          </div>
          <alchemica-placing
            v-if="leaderboardAlchemicaOrdered[0]"
            class="mb-5"
            :rank="1"
            :data="leaderboardAlchemicaOrdered[0]"
            :showModified="showModified"
            :ghstPrize="competitionData[round - 1].ghstPayouts[0]"
            @click.native="viewAddress(leaderboardAlchemicaOrdered[0].address)"/>
          <alchemica-placing
            v-if="leaderboardAlchemicaOrdered[1]"
            class="mb-5"
            :rank="2"
            :data="leaderboardAlchemicaOrdered[1]"
            :showModified="showModified"
            :ghstPrize="competitionData[round - 1].ghstPayouts[1]"
            @click.native="viewAddress(leaderboardAlchemicaOrdered[1].address)"/>
          <alchemica-placing
            v-if="leaderboardAlchemicaOrdered[2]"
            class="mb-7"
            :rank="3"
            :data="leaderboardAlchemicaOrdered[2]"
            :showModified="showModified"
            :ghstPrize="competitionData[round - 1].ghstPayouts[2]"
            @click.native="viewAddress(leaderboardAlchemicaOrdered[2].address)"/>
          <alchemica-table
            class="mb-6"
            :addresses="leaderboardAlchemicaOrdered.slice(3, shownPlaces)"
            :ghstPayouts="competitionData[round - 1].ghstPayouts.slice(3)"
            :showModified="showModified"
            @click="viewAddress"/>
          <div v-if="shownPlaces < leaderboardAlchemicaOrdered.length" class="text-center">
            <g-button
              class="px-2.5 pt-1.5 pb-3"
              :theme="'primary'"
              @click.native="shownPlaces += 50">
              Load more
            </g-button>
          </div>
        </template>
      </template>
    </div>
  </background-layout>
</template>

<script>
import { mapGetters } from 'vuex'

import AlchemicaPlacing from '@/components/leaderboards/alchemica/AlchemicaPlacing.vue'
import AlchemicaStats from '@/components/leaderboards/alchemica/AlchemicaStats.vue'
import AlchemicaTable from '@/components/leaderboards/alchemica/AlchemicaTable.vue'

export default {
  components: {
    AlchemicaPlacing,
    AlchemicaStats,
    AlchemicaTable
  },
  data () {
    return {
      loading: true,
      showRules: false,
      season: 3,
      round: parseInt(this.$route.query.round) || 1,
      showModified: true,
      shownPlaces: 50
    }
  },
  computed: {
    ...mapGetters([
      'competitionAlchemica',
      'competitionAlchemicaStats'
    ]),
    leaderboardAlchemicaOrdered () {
      let leaderboard = [...this.competitionAlchemica(this.season, this.round)].sort((a, b) => b.fudStandardSpentModified - a.fudStandardSpentModified)

      if (leaderboard.length < this.competitionData[this.round - 1].ghstPayouts.length) {
        const pad = new Array(this.competitionData[this.round - 1].ghstPayouts.length).fill({
          address: '-',
          tilesSpend: { fud: 0, fomo: 0, alpha: 0, kek: 0, fudModified: 0, fomoModified: 0, alphaModified: 0, kekModified: 0 },
          tilesMinted: 0,
          installationsSpend: { fud: 0, fomo: 0, alpha: 0, kek: 0, fudModified: 0, fomoModified: 0, alphaModified: 0, kekModified: 0 },
          installationsMinted: 0,
          totalFud: 0,
          totalFomo: 0,
          totalAlpha: 0,
          totalKek: 0,
          fudStandardSpent: 0,
          totalFudModified: 0,
          totalFomoModified: 0,
          totalAlphaModified: 0,
          totalKekModified: 0,
          fudStandardSpentModified: 0
        })
        leaderboard = leaderboard.concat(pad).slice(0, this.competitionData[this.round - 1].ghstPayouts.length)
      }

      return leaderboard
    },
    competitionData () {
      return this.$store.state.competitionData.alchemica[this.season]
    }
  },
  methods: {
    async changeRound (e) {
      this.loading = true
      this.round = e

      // Sync router params if not already
      if (`${this.round}` !== this.$route.query.round) this.$router.push({ query: { round: this.round } })

      await this.$store.dispatch('getCompetitionAddressSpend', {
        season: this.season,
        round: this.round
      })
      this.loading = false
    },
    viewAddress (address) {
      if (address) {
        this.$router.push({
          path: `/competitions/alch-spending-season-3/${address}`,
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
