<template>
<div>
  <h1>Cost Per Day</h1>
  <div id="controls">
    <label>Start Date:</label>
    <datepicker
      v-model="start"
      @closed="blur"
      :bootstrap-styling="true"
      wrapper-class="form-group"
      >
    </datepicker>
    <label>End Date:</label>
    <datepicker
      v-model="end"
      @closed="blur"
      :bootstrap-styling="true"
      wrapper-class="form-group"
      >
    </datepicker>
    
    <form @submit.prevent="newCost">
      <div class="form-group">
        <label>Thing:</label>
        <input type="text" class="form-control" v-model="thing">
      </div>
      <div class="form-group">
        <label>Cost:</label>
        <div class="input-group">
          <div class="input-group-prepend">
            <span class="input-group-text">¢</span>
          </div>
          <input type="tel" class="form-control" v-model="cost" step="0.01">
        </div>
      </div>
      <div class="form-group">
        <label>Days:</label>
        <div class="btn-group btn-group-toggle" id="dayPicker" data-toggle="buttons">
          <label :class="['btn', 'btn-secondary', 'btn-lg', { 'active': days[0] }]">
            <input type="checkbox" v-model="days[0]">S
          </label>
          <label :class="['btn', 'btn-secondary', 'btn-lg', { 'active': days[1] }]">
            <input type="checkbox" v-model="days[1]">M
          </label>
          <label :class="['btn', 'btn-secondary', 'btn-lg', { 'active': days[2] }]">
            <input type="checkbox" v-model="days[2]">T
          </label>
          <label :class="['btn', 'btn-secondary', 'btn-lg', { 'active': days[3] }]">
            <input type="checkbox" v-model="days[3]">W
          </label>
          <label :class="['btn', 'btn-secondary', 'btn-lg', { 'active': days[4] }]">
            <input type="checkbox" v-model="days[4]">T
          </label>
          <label :class="['btn', 'btn-secondary', 'btn-lg', { 'active': days[5] }]">
            <input type="checkbox" v-model="days[5]">F
          </label>
          <label :class="['btn', 'btn-secondary', 'btn-lg', { 'active': days[6] }]">
            <input type="checkbox" v-model="days[6]">S
          </label>
        </div>
      </div>
      <button type="submit" class="btn btn-primary btn-lg btn-block mt-4" :disabled="!notValid">Add</button>
    </form>
  </div>

  <div id="output" v-if="costs.length">
    <h3>Summary:</h3>
    <p>There are {{daysBetween}} days between <em>{{this.start.toDateString()}}</em> and <em>{{this.end.toDateString()}}</em>.</p>
    <table class="table table-striped table-dark">
      <thead>
        <tr>
          <th scope="col">Thing</th>
          <th scope="col" class="text-right">Cost</th>
          <th scope="col">Days</th>
          <th scope="col" class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(cost, index) in costs" :key="index" @click="removeCost(index)">
          <td scope="row">{{cost.thing}}</td>
          <td class="text-right">{{cost.cost | dollars}}</td>
          <td>{{amountDays(cost.days)}} of <span v-html="$options.filters.dayString(cost.days)"></span></td>
          <td class="text-right">{{amount(cost) | dollars}}</td>
        </tr>
        <tr class="bg-warning text-dark text-center">
          <th colspan="4" class="text-right">Total: {{sum | dollars}}</th>
        </tr>
      </tbody>
    </table>
  </div>

</div>
</template>


<style lang="scss">
h1 {
  text-align: center;
  background-color: var(--yellow);
  color: black;
  padding: 1rem 0;
}

#controls,
#output {
  padding: 1rem;
}

h3 {
  font-weight: 100;
}

.vdp-datepicker__calendar {
  margin: 0 auto;
  left: 0;
  right: 0;
}

.vdp-datepicker__calendar .selected {
  background: var(--dark) !important;
  color: var(--light);
}

.vdp-datepicker__calendar .cell:not(.blank):not(.disabled).day:hover,
.vdp-datepicker__calendar .cell:not(.blank):not(.disabled).month:hover,
.vdp-datepicker__calendar .cell:not(.blank):not(.disabled).year:hover {
  border-color: var(--dark) !important;
}

#dayPicker {
  display: flex;
  label {
    flex: 1;
  }
}

@media (hover: none) {
  .btn-secondary:hover {
    background-color: var(--secondary);
    border-color: var(--secondary);
  }
}
</style>


<script>
import Datepicker from "vuejs-datepicker";
import { DayCounter } from "./DayCounter";

module.exports = {
  data: function() {
    return {
      start: new Date(
        JSON.parse(window.localStorage.getItem("start")) || Date.now()
      ),
      end: window.localStorage.getItem("end")
        ? new Date(JSON.parse(window.localStorage.getItem("end")))
        : null,
      thing: "",
      cost: null,
      days: new Array(7).fill(false),
      costs: JSON.parse(window.localStorage.getItem("costs")) || new Array()
    };
  },
  mounted() {
    document
      .querySelectorAll(".vdp-datepicker input")
      .forEach(e => (e.readOnly = true));
  },
  computed: {
    notValid() {
      return (
        this.start &&
        this.end &&
        this.days.some(Boolean) &&
        this.thing &&
        this.cost > 0
      );
    },
    sum() {
      return this.costs.reduce((total, cost) => total + this.amount(cost), 0);
    },
    daysBetween() {
      let d = new DayCounter(this.start, this.end);
      return d.daysBetween();
    }
  },
  methods: {
    blur() {
      document.querySelector(":focus").blur();
    },
    amountDays(certainDays) {
      return new DayCounter(this.start, this.end).days(certainDays);
    },
    amount(x) {
      return new DayCounter(this.start, this.end).costForDays(
        x.cost,
        ...x.days
      );
    },
    removeCost(i) {
      if (
        confirm(
          `Are you sure you want to delete the thing called "${
            this.costs[i].thing
          }"`
        )
      )
        this.costs = this.costs.filter((_, n) => n != i);
    },
    newCost() {
      let dayNums = this.days.map((x, i) => (x ? i : -1));
      this.costs.push({
        thing: this.thing,
        cost: this.cost,
        days: dayNums //.filter(Number.isInteger),
      });
      this.thing = "";
      this.cost = null;
      this.days = new Array(7).fill(false);
      window.setTimeout(function() {
        document.querySelector("table").scrollIntoView();
      }, 500);
    }
  },
  filters: {
    dayString(days) {
      days = days.filter(x => x > -1);
      const symbols = {
        0: days.length > 1 ? "S" : "Sun",
        1: "M",
        2: days.length > 1 ? "T" : "Tue",
        3: "W",
        4: days.length > 1 ? "T" : "Thu",
        5: "F",
        6: days.length > 1 ? "S" : "Sat"
      };
      return days.map(d => symbols[d] || "").join("");
    },
    dollars(x) {
      return "$" + (x / 100).toFixed(2);
    }
  },
  watch: {
    costs(c) {
      window.localStorage.setItem("costs", JSON.stringify(c));
    },
    end(e) {
      window.localStorage.setItem("end", JSON.stringify(Number(e)));
    },
    start(s) {
      window.localStorage.setItem("start", JSON.stringify(Number(s)));
    }
  },
  components: { Datepicker }
};
</script>
