<template>
  <div class="competition">
    <div class="bg-indigo pt-3.5 pb-10">
      <div class="w-lg mx-auto">
        <g-heading :level="'2'" :styleLevel="'2'" class="text-center">
          Frenly competition brings out the best in us all!
        </g-heading>
      </div>
    </div>
    <background-layout>
      <div class="w-lg mx-auto py-10">

        <div class="flex -mx-3">
          <div class="w-1/3 px-3">
            <IndexTile
              :active="false"
              :title="'Alchemica Spending Season 1'"
              :img="'comp1-blue.png'"
              :date="'January 16th 2023'"
              :prizepool="80000"
              @click.native="$router.push('/competitions/alch-spending-season-1')"/>
          </div>
          <div class="w-1/3 px-3">
            <IndexTile
              :title="'Alchemica Spending Season 2'"
              :img="'comp1-gold.png'"
              :date="'May 1st 2023'"
              :prizepool="80000"
              @click.native="$router.push('/competitions/alch-spending-season-2')"/>
          </div>
          <div class="w-1/3 px-3">
            <IndexTile
              :active="true"
              :title="'Alchemica Spending Season 3'"
              :img="'comp3.png'"
              :date="'August 28th 2023'"
              :prizepool="60000"
              @click.native="$router.push('/competitions/alch-spending-season-3')"/>
          </div>
        </div>
      </div>
    </background-layout>
  </div>
</template>

<script>
import IndexTile from '@/components/competitions/IndexTile.vue'

export default {
  components: {
    IndexTile
  }
}
</script>
