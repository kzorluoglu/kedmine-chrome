<template>
  <div class="container">
    <h1 class="title text-center">Random Quote</h1>
    <blockquote class="quote-card">
      <p>
        {{ state.quote }}
      </p>

      <cite> {{ state.author }} </cite>
    </blockquote>
  </div>
</template>
<script>
export default {
  data() {
    return {
      state: {
        quote: "",
        author: "",
      },
    };
  },
  async created() {
    try {
      const response = await fetch("https://zenquotes.io/api/random");
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        this.state.quote = data[0].q; // Extract the quote from the response
        this.state.author = data[0].a;
      } else {
        this.state.quote = "Failed to fetch quote.";
      }
    } catch (error) {
      console.error(error);
      this.state.quote = "Error occurred while fetching quote.";
    }
  },
};
</script>
