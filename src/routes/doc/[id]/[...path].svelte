<script context="module">
  import {preload as _preload} from './_preload.js'
  // your script goes here
  export const preload = _preload
</script>

<script>
  import { onMount, tick, onDestroy } from "svelte";
  import Chapter from "../../../doc/Chapter.svelte";
  import Navbar from "../../../doc/Navbar.svelte";
  import Progress from "../../../doc/Progress.svelte";
  import BookContents from "../../../doc/BookContents.svelte";
  import Toolbar from "../../../components/Toolbar.svelte";
  import Button from "../../../components/Button.svelte";
  import InfoActions from "../../../components/InfoActions.svelte";
  import { read } from "../../../api/read.js";
  import {handleHighlight, highlightNotes}  from "./_handleHighlight.js"
  import {
    book as bookStore,
    chapter as chapterStore,
    navigation,
    contents,
    currentLocation,
    theme,
    fontSize,
    chapterTitle,
    configuringReader,
    notes
  } from "../../../doc/stores.js";
  function handleCurrent({ detail }) {
    currentLocation.set({
      location: detail.highest.dataset.location
    });
  }
  let loadedLocations = [];
  function handleAppearing({ detail }) {
    loadedLocations = loadedLocations.concat(detail.nodes);
  }
  let bookBody;
  $: if (bookBody && $fontSize) {
    bookBody.style.setProperty("--reader-font-size", `var(--${$fontSize})`);
  }
  $: if (bookBody && $theme) {
    bookBody.style.setProperty(
      "--reader-font-family",
      `var(--${$theme}-fonts)`
    );
  }
  $: if (bookBody && $notes.items) {
    highlightNotes(bookBody, $notes)
  }
  export let book;
  export let chapter;
  $: if (book) {
    bookStore.set(book);
  }
  $: if (chapter) {
    chapterStore.set(chapter);
  }
  let width = 0;
  let sidebar = true;
  let sidebargrid = true;
  let sidebarWidth;
  $: if (
    sidebarWidth !==
    getComputedStyle(document.documentElement).getPropertyValue(
      "--reader-sidebar-width"
    ) +
      "px"
  ) {
    document.documentElement.style.setProperty(
      "--reader-sidebar-width",
      sidebarWidth + "px"
    );
  }

  onMount(async () => {
    window.lifecycle.addEventListener("statechange", handleLifeCycle);
    await tick();
    if ($bookStore.position && $bookStore.position.path === $chapterStore.url) {
      const location = document.querySelector(
        `[data-location="${$bookStore.position.location}"]`
      );
      if (location) {
        location.scrollIntoView({ behavior: "smooth" });
      }
    };
  });
  onDestroy(() => {
      const location = $currentLocation.location;
      const chapter = $chapterStore.url;
      const url = new URL(`/${$bookStore.id}/`, $chapterStore.url).href

      read(url, location, chapter);
      window.lifecycle.removeEventListener("statechange", handleLifeCycle);
    })
  function handleLifeCycle(event) {
    if (
      window.lifecycle.state === "passive" &&
      event.oldState === "active" &&
      $currentLocation
    ) {
      const url = new URL(`/${$bookStore.id}/`, $chapterStore.url).href
      read(url, $currentLocation.location, $chapterStore.url);
    }
  }
  let selectionRange = null
  document.addEventListener('selectionchange', () => {
    const selection = document.getSelection()
    if (selection && !selection.isCollapsed) {
      selectionRange = selection.getRangeAt(0)
    } else {
      selectionRange = null
    }
  });
</script>

<style>
  .Sidebar {
    display: none;
  }
  @media (min-width: 1024px) {
    .BookBody.sidebar {
      display: grid;
      grid-template-columns: minmax(300px, 0.4fr) 1fr;
      grid-template-areas:
        "sidebar body"
        "sidebar body"
        "sidebar body";
    }
    .BookBody.sidebar :global(.Chapter) {
      grid-column: 2 / -1;
    }
    .Sidebar {
      display: block;
      background-color: white;
      height: 100vh;
      position: sticky;
      top: 0px;
      grid-area: sidebar;
      padding: 0 0.25rem;
    }
  }
  .LeftButton {
    align-self: flex-start;
  }
  label,
  select,
  option {
    font-size: 1em;
  }
  select {
    display: inline-block;
    color: var(--dark);
    padding: 0.5em 2.5em 0.5em 0.5em;
    max-width: 100%;
    box-sizing: border-box;
    margin: 0;
    border: 1px solid var(--rc-dark);
    border-radius: 2px;
    -moz-appearance: none;
    -webkit-appearance: none;
    appearance: none;
    background-color: transparent;
    background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2332A5A5%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22square%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E"),
      linear-gradient(to bottom, transparent 0%, transparent 100%);
    background-repeat: no-repeat, repeat;
    background-position: right 0.7em top 50%, 0 0;
    background-size: 1em auto, 100%;
  }
  select::-ms-expand {
    display: none;
  }
  select:hover {
    border-color: var(--rc-main);
    cursor: pointer;
  }
  @keyframes outlinePop {
    0% {
      box-shadow: 0 0 0 1px rgba(33, 33, 33, 0);
    }
    50% {
      box-shadow: 0 0 0 8px var(--rc-darker);
    }
    100% {
      box-shadow: 0 0 0 3px var(--rc-dark);
    }
  }
  select:focus {
    box-shadow: 0 0 0 3px var(--rc-dark);

    outline: solid transparent;
    animation: outlinePop 0.25s ease-in-out;
  }
  select option {
    font-weight: normal;
    text-transform: none;
  }
  .SelectLabel {
    padding: 0 0.25rem;
  }
  .TextButton {
    display: inline-block;

    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    text-align: center;
    white-space: nowrap;
    text-decoration: none;

    color: var(--link);
    border: none;
    background-color: transparent;

    -ms-touch-action: manipulation;
    touch-action: manipulation;
    text-transform: uppercase;
    text-decoration: none;
    line-height: 0.1;
    display: flex;
    align-items: center;
    padding: 0.5rem calc(1rem - 16px);
    text-transform: uppercase;
    font-size: 0.75rem;
    border-radius: 0;
    margin-top: 0;
  }
  .TextButton {
    padding: 0 1rem;
    text-align: right;
    display: inline-block;
    height: 24px;
  }
  .TextButton:hover {
    background-color: var(--hover);
    color: var(--light);
  }
  @media (max-width: 1025px) {
    .SelectLabel {
      display: none;
    }
  }
</style>

<svelte:window bind:innerWidth={width} />
<svelte:head>
  {#if chapter.stylesheets.length !== 0}
    {#each chapter.stylesheets as sheet}
      <link
        rel="stylesheet"
        href={`/api/clean-css?css=${encodeURIComponent(sheet)}`} />
    {/each}
  {/if}
  <title>{book.name} - {$chapterTitle} - Rebus Ink</title>
</svelte:head>

{#if book}
  <div
    class="BookBody"
    bind:this={bookBody}
    class:sidebar={sidebargrid}
    data-current={$currentLocation.location}>
    {#if sidebar}
      <div
        bind:clientWidth={sidebarWidth}
        class="Sidebar">
        <BookContents modal={false} />
      </div>
    {/if}
    <!-- Menubar -->
    <Toolbar>
      <span slot="left-button" class="LeftButton">

        <Progress
          chapters={book.readingOrder}
          current={chapter.index}
          {width}
          on:toggle-sidebar={() => {
            sidebar = !sidebar;
            sidebargrid = !sidebargrid
          }} />
      </span>
      <span slot="toolbar-title">
        {#if $configuringReader}
          <label>
            <span class="SelectLabel">Theme</span>
            <select
              name="viewConfig"
              id="Theme"
              on:change={event => theme.save(event.target.value)}>
              <!-- 
  --fonts: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen-Sans, Ubuntu, Cantrell, "Helvetica Neue", sans-serif,
    "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  --old-style-fonts: "Iowan Old Style", "Sitka Text", Palatino, "Book Antiqua",
    serif;
  --modern-serif-fonts: Athelas, Constantia, Georgia, serif;
  --neutral-fonts: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI",
    Roboto, Noto, "Helvetica Neue", Arial, sans-serif;
  --humanist-sans-fonts: Seravek, Calibri, Roboto, Arial, sans-serif;
  --monospace-fonts: "Andale Mono", Consolas, monospace; -->
              <option
                value="old-style"
                selected={$theme === 'old-style'}
                aria-label="Old Style (Default)">
                Old Style (Default)
              </option>
              <option
                value="modern-serif"
                selected={$theme === 'modern-serif'}
                aria-label="Modern Serif">
                Modern Serif
              </option>
              <option
                value="neutral"
                selected={$theme === 'neutral'}
                aria-label="Neutral">
                Neutral
              </option>
              <option
                value="humanist-sans"
                selected={$theme === 'humanist-sans'}
                aria-label="Humanist Sans">
                Humanist Sans
              </option>
              <option
                value="duo-accessible"
                selected={$theme === 'duo-accessible'}
                aria-label="Duo (accessible)">
                Duo (accessible)
              </option>
            </select>
          </label>
          <label>
            <span class="SelectLabel">Font Size</span>
            <select
              name="viewConfig"
              id="viewConfig"
              on:change={event => fontSize.save(event.target.value)}>

              <option
                value="xx-small"
                selected={$fontSize === 'xx-small'}
                aria-label="Tiny">
                Tiny
              </option>
              <option
                value="x-small"
                selected={$fontSize === 'x-small'}
                aria-label="Extra Small">
                Extra Small
              </option>
              <option
                value="small"
                selected={$fontSize === 'small'}
                aria-label="Small">
                Small
              </option>
              <option
                value="regular"
                selected={$fontSize === 'regular'}
                aria-label="Regular">
                Regular
              </option>
              <option
                value="bigger"
                selected={$fontSize === 'bigger'}
                aria-label="Bigger">
                Bigger
              </option>
              <option
                value="large"
                selected={$fontSize === 'large'}
                aria-label="Large">
                Large
              </option>
              <option
                value="x-large"
                selected={$fontSize === 'x-large'}
                aria-label="Extra Large">
                Extra Large
              </option>
            </select>
          </label>
        {:else}{book.name}{/if}
      </span>
      <span slot="right-button">
        {#if $configuringReader}
          <button
            data-close-modal
            class="TextButton"
            on:click={event => {
              configuringReader.update(state => !state);
            }}>
            Done
          </button>
        {/if}
      </span>
    </Toolbar>
    <!-- Should have all chapters appear, they should get values from stores and only use props for chapter assignments. Only when props match store is the chapter rendered -->
    {#each book.readingOrder as chapter, index}
      <Chapter
        on:current={handleCurrent}
        on:appearing={handleAppearing}
        chapterIndex={index} />
    {/each}

    {#if $navigation}
      <Navbar navigation={$navigation}>
      {#if selectionRange}
         <Button click={() => {
           handleHighlight(selectionRange, bookBody, chapter)
         }}>Highlight</Button>
      {/if}
      </Navbar>
    {:else}
      <Navbar />
    {/if}
  </div>
{/if}
