<script>
  import ContentsItem from "./ContentsItem.svelte";
  export let contents;
  export let book;
  let current;
  $: if (book && book.position && book.position.path) {
    current = book.position.path;
  }
</script>

<style>
  .Contents {
    counter-reset: contents;
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .Contents > :global(li > ol) {
    counter-reset: contents;
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .ContentsHeading {
    text-align: left;
    margin: 0 0 1rem;
    padding: 0 1rem;
  }
  /* .Contents > :global(li > ol > li > a:before), .Contents > :global(li > ol > li > span:before) {
    content: counter(subcontents) ". ";
    color: var(--dark);
  } */
</style>

<h1 class="ContentsHeading">{contents.heading}</h1>
<ol class="Contents">
  {#each contents.children as item}
    <ContentsItem {item} {current} />
    <!-- content here -->
  {/each}
</ol>
