const patches = [
    { from: 0x241, data: [0xBE, 0xFF], },
    { from: 0x4788, data: [0xA6, 0xFF] },
    { from: 0x480C, data: [0xB8, 0xFF] },
    { from: 0x7FB6, data: [
        0xA9,0x20,0x8D,0xFA,0x01,0xA9,0x20,0x8D,0xFB,0x01,0xA9,0x20,0x8D,0xFC,0x01,0x4C,
        0xCC,0x99,0xEE,0x20,0x06,0x4C,0x96,0xBA,0xA2,0x00,0xAD,0x20,0x06,0xE8,0x38,0xE9,
        0x64,0xB0,0xFA,0x86,0x00,0xA2,0x00,0x69,0x64,0xE8,0x38,0xE9,0x0A,0xB0,0xFA,0x86,
        0x01,0x69,0x0A,0x85,0x02,0x18,0xA2,0x04,0x69,0x30,0x20,0x33,0x82,0x18,0xA2,0x00,
        0xA5,0x00,0x69,0x2F,0x20,0x33,0x82,0x18,0xA2,0x02,0xA5,0x01,0x69,0x2F,0x20,0x33,
        0x82,0x4C,0xE3,0x99
    ] },
];

export function patchRom(rng: any[]) {

    const f = document.createElement('input');
    f.setAttribute('type', 'file');
    f.setAttribute('accept', '.nes');
    f.style.display = 'none';
    document.body.appendChild(f);

    f.addEventListener('change', function (evt) {
        const file = f.files?.item(0);
        const bfr = file?.arrayBuffer().then(ab => {
            const ub = new Uint8Array(ab);
            for (const patch of patches) {
                for (let i=0; i<patch.data.length; ++i) {
                    ub[patch.from + i] = patch.data[i];
                }
                ub[0x7FB6 + 1] = rng[0];
                ub[0x7FB6 + 6] = rng[1];
                ub[0x7FB6 + 11] = rng[2];
            }
            var file = new Blob([ub], { type: 'octet/stream' })
            var url = URL.createObjectURL(file);
            
            var link = document.createElement('a');
            link.download = 'practise.nes';
            link.href = url;
            link.click();
            
            URL.revokeObjectURL(url);
        })
        console.log('got a file', bfr);
    })

    f.click();

}