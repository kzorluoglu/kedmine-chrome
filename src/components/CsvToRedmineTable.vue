<template>
  <div>
    <div v-if="!redmineTableText">
      <div class="row mb-3">
        <div class="col-12">
          <textarea v-model="csvText" class="form-control" placeholder="Paste CSV text here" rows="10"></textarea>
        </div>
      </div>

      <div class="row mb-3">
        <div class="col-12">
          <button @click="convertToRedmineTableFormat" class="btn btn-primary">Generate Redmine Table</button>
        </div>
      </div>
    </div>

    <div v-else>
      <div class="row mb-3">
        <div class="col-12">
          <textarea v-model="redmineTableText" class="form-control" rows="10" readonly></textarea>
        </div>
      </div>

      <div class="row mb-3">
        <div class="col-12">
          <button @click="copyToClipboard" class="btn btn-secondary">Copy Generated Table to Clipboard</button>
        </div>
      </div>

      <div class="row mb-3">
        <div class="col-12">
          <button @click="goBack" class="btn btn-secondary">Generate New Text</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CsvToRedmineTable',
  data() {
    return {
      csvText: null,
      redmineTableText: null
    };
  },
  methods: {
    convertToRedmineTableFormat() {
      const lines = this.csvText.trim().split('\n');
      this.redmineTableText = '';
      lines.forEach((line, index) => {
        const columns = line.split(',');
        let tableRow = '|';
        columns.forEach(column => {
          // Check if the row is the header row
          if (index === 0) {
            tableRow += `_.${column}|`;
          } else {
            // Add quotes if the column contains special characters or spaces
            tableRow += `${column.includes(' ') || /[\W_]+/.test(column) ? `"${column}"` : column}|`;
          }
        });
        this.redmineTableText += `${tableRow}\n`;
      });
    },
    copyToClipboard() {
      navigator.clipboard.writeText(this.redmineTableText).then(() => {
        alert('Copied to clipboard!');
      }).catch(err => {
        console.error('Error in copying text: ', err);
      });
    },
    goBack() {
      this.redmineTableText = null;
    }
  },
};
</script>

<style scoped>
</style>
