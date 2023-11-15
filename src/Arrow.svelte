<script lang="ts">
const colors = [
    "rgb(98, 98, 98)",         // 00
    "rgb(0, 31, 178)",         // 01
    "rgb(36, 4, 200)",         // 02
    "rgb(82, 0, 178)",         // 03
    "rgb(115, 0, 118)",        // 04
    "rgb(128, 0, 36)",         // 05
    "rgb(115, 11, 0)",         // 06
    "rgb(82, 40, 0)",          // 07
    "rgb(36, 68, 0)",          // 08
    "rgb(0, 87, 0)",           // 09
    "rgb(0, 92, 0)",           // 0A
    "rgb(0, 83, 36)",          // 0B
    "rgb(0, 60, 118)",         // 0C
    "rgb(0, 0, 0)",            // 0D
    "rgb(0, 0, 0)",            // 0E
    "rgb(0, 0, 0)",            // 0F
    "rgb(171, 171, 171)",      // 10
    "rgb(13, 87, 255)",        // 11
    "rgb(75, 48, 255)",        // 12
    "rgb(138, 19, 255)",       // 13
    "rgb(188, 8, 214)",        // 14
    "rgb(210, 18, 105)",       // 15
    "rgb(199, 46, 0)",         // 16
    "rgb(157, 84, 0)",         // 17
    "rgb(96, 123, 0)",         // 18
    "rgb(32, 152, 0)",         // 19
    "rgb(0, 163, 0)",          // 1A
    "rgb(0, 153, 66)",         // 1B
    "rgb(0, 125, 180)",        // 1C
    "rgb(0, 0, 0)",            // 1D
    "rgb(0, 0, 0)",            // 1E
    "rgb(0, 0, 0)",            // 1F
    "rgb(255, 255, 255)",      // 20
    "rgb(83, 174, 255)",       // 21
    "rgb(144, 133, 255)",      // 22
    "rgb(211, 101, 255)",      // 23
    "rgb(255, 87, 255)",       // 24
    "rgb(255, 93, 207)",       // 25
    "rgb(255, 119, 87)",       // 26
    "rgb(250, 158, 0)",        // 27
    "rgb(189, 199, 0)",        // 28
    "rgb(122, 231, 0)",        // 29
    "rgb(67, 246, 17)",        // 2A
    "rgb(38, 239, 126)",       // 2B
    "rgb(44, 213, 246)",       // 2C
    "rgb(78, 78, 78)",         // 2D
    "rgb(0, 0, 0)",            // 2E
    "rgb(0, 0, 0)",            // 2F
    "rgb(255, 255, 255)",      // 30
    "rgb(182, 225, 255)",      // 31
    "rgb(206, 209, 255)",      // 32
    "rgb(233, 195, 255)",      // 33
    "rgb(255, 188, 255)",      // 34
    "rgb(255, 189, 244)",      // 35
    "rgb(255, 198, 195)",      // 36
    "rgb(255, 213, 154)",      // 37
    "rgb(233, 230, 129)",      // 38
    "rgb(206, 244, 129)",      // 39
    "rgb(182, 251, 154)",      // 3A
    "rgb(169, 250, 195)",      // 3B
    "rgb(169, 240, 244)",      // 3C
    "rgb(184, 184, 184)",      // 3D
    "rgb(0, 0, 0)",            // 3E
    "rgb(0, 0, 0)",            // 3F
];

const frames = [
0x0C,
0x01,
0x02,
0x03,
0x1C,
0x11,
0x12,
0x13,
0x2C,
0x21,
0x22,
0x23,
0x3C,
0x31,
0x32,
0x33,
0x33,
0x32,
0x31,
0x3C,
0x23,
0x22,
0x21,
0x2C,
0x13,
0x12,
0x11,
0x1C,
0x03,
0x02,
0x01,
0x0C,
]

export let frame: number = 0;

function getColor() {
    const f = frames[((frame + 11) % frames.length)];
    if (f <= 0x10) return colors[0xF];
    return colors[f - 0x10];
}

</script>

<div data-x={String((frame+11)%frames.length)} style:background-color={getColor()} class="arrow"></div>

<style>
    .arrow {
        background-image: url('./arrow.png');
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
        width: 29px;
        height: 29px;
    }    
</style>