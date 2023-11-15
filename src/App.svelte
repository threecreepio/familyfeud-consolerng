<script lang="ts">
  import fam0m from "./fam0m.png";
  import fam1m from "./fam1m.png";
  import fam2m from "./fam2m.png";
  import fam0f from "./fam0f.png";
  import fam1f from "./fam1f.png";
  import fam2f from "./fam2f.png";
  import { questions } from "./questions";
    import { patchRom } from "./patchRom";
    import HexView from "./HexView.svelte";
    import Arrow from "./Arrow.svelte";
  const famimgs = [
    [fam0m, fam0f],
    [fam1m, fam1f],
    [fam2m, fam2f],
  ];

  let page = 0;
  let framecounter: string =
    localStorage.getItem("FF_CONSOLERNG_FRAMECOUNTER") || "3C";
  let rng1: string = localStorage.getItem("FF_CONSOLERNG_RNG1") || "DF";
  let rng2: string = localStorage.getItem("FF_CONSOLERNG_RNG2") || "02";
  let rng3: string = localStorage.getItem("FF_CONSOLERNG_RNG3") || "01";

  $: {
    localStorage.setItem("FF_CONSOLERNG_FRAMECOUNTER", framecounter);
    localStorage.setItem("FF_CONSOLERNG_RNG1", rng1);
    localStorage.setItem("FF_CONSOLERNG_RNG2", rng2);
    localStorage.setItem("FF_CONSOLERNG_RNG3", rng3);
  }

  function resetTimer(v: string) {
    const i = parseInt(v, 16);
    return 0x3c - i + 6;
  }

  const rol = (v: number, c: boolean) => {
    let r = (v << 1) + (c ? 1 : 0);
    return [r & 0xff, r > 0xff] as [number, boolean];
  };
  const advanceRNG = (rng: number[]) => {
    let a = rng[2];
    a &= 0x80;
    a >>= 1;
    a ^= rng[2];
    let c = a > 0xff;
    [a, c] = rol(a & 0xff, c);
    [a, c] = rol(a & 0xff, c);
    let out: number[] = [];
    [out[0], c] = rol(rng[0] & 0xff, c);
    [out[1], c] = rol(rng[1] & 0xff, c);
    [out[2], c] = rol(rng[2] & 0xff, c);
    return out;
  };

  function startingRNG(
    frame: string,
    rng1: string,
    rng2: string,
    rng3: string
  ) {
    const timer = resetTimer(frame);
    let rng = [rng1, rng2, rng3].map((v) => parseInt(v, 16));
    for (let i = timer; i < 380; ++i) {
      if (i === 318 || i === 319 || i == 352) continue; // lag frames
      rng = advanceRNG(rng);
    }
    return rng;
  }

  function getRNG(
    frame: string,
    rng1: string,
    rng2: string,
    rng3: string,
    fr: number
  ) {
    let rng = startingRNG(frame, rng1, rng2, rng3);
    let modsteps = 380 + fr >= 388 ? -3 : 0;
    if (modsteps && Math.floor((380 + fr - 388) % 32) >= 24) modsteps += 3;
    //const modsteps1 = (380 + fr) >= 388 ? Math.floor(((380 + fr) - 388) / 32) : 0;
    //const modsteps2 = (380 + fr) >= 388 ? Math.floor(((380 + fr) - 388) % 32) : 0;
    //if (380 + fr >= 388) modsteps -= 3; // weird game thing
    //if (380 + fr >= 412) modsteps += 3;
    //if (380 + fr >= 420) modsteps -= 3;
    //if (380 + fr >= 444) modsteps += 3;
    //if (380 + fr >= 452) modsteps -= 3;

    //if (fr >= 8) modsteps = (-3 * ((modsteps1 & 1) ? 0 : 1)) * (modsteps2 >= 24 ? 0 : 1);
    //console.log(modsteps1, modsteps2, modsteps);

    for (let i = 0; i < fr + modsteps; ++i) rng = advanceRNG(rng);
    let q = -1,
      fm = -1,
      fam1 = -1,
      fam2 = -1;

    let sum = 0;
    while (!rng[0]) rng = advanceRNG(rng);
    q = rng[0] + ((rng[1] & 1) << 8);
    sum += q;
    if (sum >= 381) {
      rng = advanceRNG(rng);
      sum = -1000;
    }

    do {
      rng = advanceRNG(rng);
    } while (!rng[0]);
    fm = rng[0] + ((rng[1] & 1) << 8);
    sum += fm;
    if (sum >= 381) {
      rng = advanceRNG(rng);
      sum -= 385;
    }
    //if (q < 385) rng = advanceRNG(rng);
    //rng = advanceRNG(rng);

    do {
      rng = advanceRNG(rng);
    } while (!(rng[0] & 0b11));
    fam1 = (rng[0] & 0b11) - 1;

    do {
      rng = advanceRNG(rng);
    } while (!(rng[0] & 0b11) || (rng[0] & 0b11) - 1 === fam1);
    fam2 = (rng[0] & 0b11) - 1;

    return {
      frame: fr + 380,
      question: (1 + q) % 479,
      fastMoney: (1 + fm) % 472,
      family1: fam1,
      family2: fam2,
      ms: modsteps,
    };
  }

  function createRom() {
    const timer = resetTimer(framecounter) - 1;
    let rng = [rng1, rng2, rng3].map((v) => parseInt(v, 16));
    for (let i = timer; i < 350; ++i) {
      if (i === 318 || i === 319 || i == 352) continue; // lag frames
      rng = advanceRNG(rng);
    }

    patchRom(rng);
  }

  function getPageFrames(p: number) {
    var startingFrames: number[] = [];
    for (let i = 0; i < 120; ++i) startingFrames.push(i + (p * 120));
    return startingFrames;
  }


  function gotoPrevPage() { page = Math.max(0, page - 1); }
  function gotoNextPage() { page = page + 1; }
</script>

<main>
  <h1>Family Feud Console RNG Tester</h1>

  <p>
    This site will help you figure out what your console RNG state is with an
    original Family Feud cart.<br />I know we've all been *dying* to know!
  </p>

  <details>
    <summary>Everdrive configuration</summary>
    <p>
      To start with you're going to need a slightly modified Everdrive OS.<br />
      <a href="https://github.com/threecreepio/EDN8-PRO-INITRAM/releases/latest">
        Go to the github page for the modified OS and download the nesos.nes rom
      </a>
    </p>
    <p>
      It's based off Everdrive version 2.15, if you have a later version you may need
      to download an earlier release first and downgrade.
    </p>
    <p>
      After you have the nesos.nes rom, you'll want to place it in the EDN8 folder
      on your everdrives SD card, and that's all you have to do to get it set up.
    </p>
    <p>
      Now whenever you start the everdrive while holding the <kbd>RIGHT</kbd> button it will create a file called <code>EDN8/initram.bin</code>.
      Opening this file in Everdrives "Hex View" lets you inspect RAM state.
    </p>
  </details>

  <details>
    <summary>Finding your Family Feud RAM</summary>
    <h3>Creating the RAM file</h3>
    <p>
      Now that you have the Everdrive OS set up, you want to put the original Family Feud cartridge in your console.
    </p>
    <p>
      Start the game and then quickly start HOLDING down the <kbd>RESET</kbd> button. You want to wait at least 10 frames or so, at most 60, after power-on.
    </p>
    <p>
      While holding <kbd>RESET</kbd>, take the Family Feud cartridge out of your console and insert the Everdrive cartridge.<br />
      While still holding <kbd>RESET</kbd>, start also holding the <kbd>RIGHT</kbd> button on your controller, then release <kbd>RESET</kbd>. When the Everdrive menu is shown you can release <kbd>RIGHT</kbd>.<br />
      <em>Note that since your consoles RNG can be unstable you may need to do this multiple times to see how often you get each possible starting question.</em>
    </p>
    <h3>Checking the results</h3>
    <p>
      In your Everdrive menu, select the <code>EDN8/initram.bin</code> file and press "Hex View". This will show a big list of hexadecimal numbers all over the screen.<br />
      You're going to need to write down 4 of those values.<br />
    </p>
    <div class="first-hexview" style="display:grid;grid-template-columns:min-content 1fr;gap:16px;">
      <HexView />
      <div style="max-width:30em">
        <p>On the first page of the hex view you're going to need to copy byte <kbd>26</kbd>, this is a frame count that counts from 60 down to 0.</p>
        <p>It should be 6 pairs of numbers from the left, 2 rows down on the page. You can see its position highlighted to the left.</p>
        <p>After you have it, press <kbd>DOWN</kbd> to go to the next page.</p>
      </div>
    </div>
    <div class="second-hexview" style="display:grid;grid-template-columns:min-content 1fr;gap:16px;">
      <HexView start={0x100} />
      <div style="max-width:30em">
        <p>On the second page of the hex view you're going to need to copy bytes <kbd>1FA</kbd>, <kbd>1FB</kbd> and <kbd>1FC</kbd>. These are the games actual RNG values.</p>
        <p>These are on the bottom row, 5th, 4th and 3rd from the right. You can see them highlighted on the left.</p>
      </div>
    </div>
    <p>
      Now that you have your values, you can fill them in in the form below.<br />
      This will show which questions you will get in the game for every delay you could do on the menu screen.
    </p>
    <p>
      You can also download a practise rom that will show you which frame you've started on and give you the correct questions for your console even on emulator.
    </p>
  </details>


  <details>
    <summary>What does the list mean?</summary>
    <p>
      After you've filled in the form, you'll get a list of starting states.<br />
      The first one is the one you will get if you use no delay to enter the game, if you buffer inputs through the menu screens.
    </p>
    <p>
      The first column, <kbd>Frame</kbd>, is the number of frames delayed. It is shown in the game as the Player 1 score if you use the practise rom.<br />
      You can use this to practise hitting the correct frame to get the seed you want.
    </p>
    <p>
      The second column, <kbd>Question Group</kbd>, is the first possible starting question you can get with this seed.<br />
      If you look at <a target="_blank" href="https://docs.google.com/spreadsheets/d/1awNjcCSov46xAqZpmkUKB6oSd6Zqe7gDgyZOrvzB4Dk/edit">the Question Guide</a> you can find the question there.<br />
      The actual question you get in the game will be the question displayed or the 7 following it in the guide, if you have successfully hit the seed.
    </p>
    <p>
      The third column, <kbd>Fast Money Group</kbd>, is the first question you will get in the Fast Money round after you have accumulated $200 in the normal game.<br />
      You can also find these in the guide.
    </p>
    <p>
      The third column, <kbd>Arrow</kbd>, is the color of the arrow on the title screen as the game is starting. You can use this to gauge your timing.
    </p>
    <p>
      The fourth and fifth columns, <kbd>Family 1</kbd> and <kbd>Family 2</kbd> are the left and right families that you will see in game if you hit the seed.<br />
      This can be used as an indication for if you might have hit the correct seed.
    </p>
    <p>
      Have fun!
    </p>
  </details>

  <hr />

  <table>
    <tr>
      <td>Frame counter (0026)</td>
      <td><input bind:value={framecounter} /></td>
    </tr>
    <tr>
      <td>RNG Value 1 (01FA)</td>
      <td><input bind:value={rng1} /></td>
    </tr>
    <tr>
      <td>RNG Value 2 (01FB)</td>
      <td><input bind:value={rng2} /></td>
    </tr>
    <tr>
      <td>RNG Value 3 (01FC)</td>
      <td><input bind:value={rng3} /></td>
    </tr>
  </table>

  <p style="opacity:0.35;">
    Based on those values, you pressed reset {resetTimer(framecounter)} frames after
    startup and would have a first question RNG seed of {startingRNG(framecounter, rng1, rng2, rng3).map(v => v.toString(16).padStart(2, '0'))}
  </p>

  <p><button on:click={createRom}>Click here to create a ROM with this starting seed, select a Family Feud ROM in the file select.</button></p>


  <div style="display:grid;grid-template-columns: 1fr 3fr 1fr;align-items:center;margin: 24px 0;">
    <button disabled={page === 0} on:click={gotoPrevPage}>Less delay</button>
    <div style="text-align:center;">Delay starting at {page * 2} seconds</div>
    <button on:click={gotoNextPage}>More delay</button>
  </div>
  <table>
    <thead>
      <tr>
        <th class="frame">Frame</th>
        <th>Question Group</th>
        <th>Fast Money Group</th>
        <th class="arrow">Arrow</th>
        <th class="fam">Family 1</th>
        <th class="fam">Family 2</th>
      </tr>
    </thead>
    <tbody>
      {#each getPageFrames(page) as fr}
        {@const seedrng = getRNG(framecounter, rng1, rng2, rng3, fr)}
        <tr>
          <td class="frame" title={`${seedrng.frame - 379} frames wait on the title screen`}>
            {((seedrng.frame - 379) % 256).toString().padStart(3, '0')}
          </td>
          <td title={String(seedrng.question + 2)}>
            <div class="q">
              <div class="txt">{questions[seedrng.question]}</div>
              <div class="num">Q{seedrng.question}</div>
            </div>
          </td>
          <td title={String(seedrng.fastMoney + 2)}>
            <div class="fm q">
              <div class="txt">{questions[479 + seedrng.fastMoney]}</div>
              <div class="num">F{seedrng.fastMoney}</div>
            </div>
          </td>
          <td class="arrow">
            <div class="arrow">
              <Arrow frame={(seedrng.frame - 379)} />
            </div>
          </td>
          <td class="fam">
            <div class="fam">
              <img
                alt={`Family ${seedrng.family1}`}
                src={famimgs[seedrng.family1][1]}
              />
              <img
                alt={`Family ${seedrng.family1}`}
                src={famimgs[seedrng.family1][0]}
              />
            </div>
          </td>
          <td class="fam">
            <div class="fam">
              <img
                alt={`Family ${seedrng.family2}`}
                src={famimgs[seedrng.family2][0]}
              />
              <img
                alt={`Family ${seedrng.family2}`}
                src={famimgs[seedrng.family2][1]}
              />
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</main>

<style>
  main {
    line-height: 1.5;
  }
  details {
    margin-bottom: 2rem;
  }
  summary {
    font-size: 1.5rem;
    font-weight: bold;
    cursor: pointer;
  }
  div.arrow {
    display: flex;
    justify-content: center;

  }
  th.arrow, th.fam {
    text-align: center;
  }
  th {
    font-family: JetBrains Mono, monospace;
  }
  .frame {
    text-align: center;
    font-family: JetBrains Mono, monospace;
  }
  div.fam {
    padding-top: 4px;
    background-color: #db2800;
    display: flex;
    justify-content: center;
  }
  img {
    image-rendering: pixelated;
  }
  .q {
    font-family: JetBrains Mono, monospace;
    width: 179px;
    height: 133px;
    background: #00e8d8;
    border: 4px solid #000;
    padding: 4px;
    border-radius: 8px;
    color: #000;

    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .q .num {
    text-align: right;
    opacity: 0.6;
  }
  .fm.q {
    background: #0000a8;
    border-color: #c4c4c4;
    color: #c4c4c4;
  }


  .first-hexview :global(.byte-26) {
    opacity: 1 !important;
  }
  .second-hexview :global(.byte-fa),
  .second-hexview :global(.byte-fb),
  .second-hexview :global(.byte-fc) {
    opacity: 1 !important;
  }
  .first-hexview {
    margin-bottom: 1em;
  }
</style>
