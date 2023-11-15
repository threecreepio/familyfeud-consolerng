<script lang="ts">
    import bin from './ramdump.bin?uint8array'
    export let start = 0;
</script>

<div class="bg">
    <div class="rows">
        <div class="title">
            {start.toString(16).padStart(8, '0').toUpperCase()}
            of
            {0x800 .toString(16).padStart(8, '0').toUpperCase()}
        </div>
        <div class="hex">
            {#each bin.slice(start, start + 0x100) as byte, i}
            <span class={`byte-${i.toString(16).padStart(2, '0')}`}>{byte.toString(16).padStart(2, '0').toUpperCase()}</span>
            {/each}
        </div>
    </div>
</div>

<style>
.bg {
    display: flex;
    width: 484px;
}
.rows {
    background: black;
    padding: 8px;
    display: flex;
    flex-direction: column;
    transform-origin: top left;
    font-family: JetBrains Mono, monospace;
    line-height: 1;
    transform: scaleX(1.5);
}
.title {
    background: #444444;
    color: #efefef;
}
.hex {
    display: grid;
    grid-template-columns: repeat(16, min-content);
    color: goldenrod;
}
.hex > span {
    border-bottom: 4px solid transparent;
    opacity: 0.5;
}
.hex > span:nth-child(2n) {
    color: #efefef;
}
</style>