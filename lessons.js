const LESSONS=[
{id:1,title:'Variabel, operator, print dan input',html:`
<p>Program Python dijalankan baris demi baris. <code>print()</code> menampilkan hasil, dan <code>input()</code> membaca masukan dari pengguna sebagai <b>teks</b>.</p>
<pre>nama = "Budi"
umur = 15
print("Halo,", nama)
print(umur + 1)</pre>
<p>Karena <code>input()</code> selalu menghasilkan teks, ubah dulu dengan <code>int()</code> sebelum menghitung:</p>
<pre>angka = int(input("Angka: "))
print(angka * 2)</pre>
<p>Isi kotak <b>Input</b> di bawah editor, satu baris untuk setiap <code>input()</code>, sebelum menekan Jalankan.</p>`,
ex:[
{t:'Halo, Dunia!',task:'Tampilkan tulisan <code>Halo, Dunia!</code> dengan <code>print()</code>.',start:'# tulis kodemu di bawah\n',hints:['Teks ditulis di antara tanda kutip.','print("...")'],tests:[{i:[],o:'Halo, Dunia!'}]},
{t:'Menyapa',task:'Baca sebuah nama dengan <code>input()</code>, lalu tampilkan <code>Halo, </code> diikuti nama itu dan tanda seru. Contoh: masukan <code>Budi</code> menghasilkan <code>Halo, Budi!</code>',start:'nama = input("Nama: ")\n',hints:['Gabungkan teks dengan +, atau pakai f-string.','print("Halo, " + nama + "!")'],tests:[{i:['Budi'],o:'Halo, Budi!'},{i:['Sari'],o:'Halo, Sari!'}]},
{t:'Menjumlah',task:'Baca dua bilangan bulat, lalu tampilkan hasil penjumlahannya.',start:'a = input("Bilangan 1: ")\nb = input("Bilangan 2: ")\n',hints:['input() menghasilkan teks, bukan angka.','Ubah dengan int(...) sebelum dijumlahkan.'],tests:[{i:['3','4'],o:'7'},{i:['10','25'],o:'35'},{i:['-2','8'],o:'6'}]}]},
{id:2,title:'Percabangan if dan else',html:`
<p><code>if</code> menjalankan kode hanya jika kondisinya benar. <code>else</code> menjalankan kode jika kondisinya salah. Perhatikan titik dua <code>:</code> dan <b>jorokan</b> (4 spasi) pada isinya.</p>
<pre>nilai = int(input("Nilai: "))
if nilai >= 75:
    print("Lulus")
else:
    print("Tidak lulus")</pre>
<p>Operator pembanding: <code>==</code> (sama dengan), <code>!=</code>, <code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code>, <code>&gt;=</code>. Jangan tertukar dengan <code>=</code> yang berarti mengisi variabel.</p>`,
ex:[
{t:'Lulus atau tidak',task:'Baca sebuah nilai. Jika nilai &ge; 75 tampilkan <code>Lulus</code>, selain itu tampilkan <code>Tidak lulus</code>.',start:'nilai = int(input("Nilai: "))\n',hints:['Kondisinya: nilai >= 75','Jangan lupa : setelah if dan else, lalu jorokkan isinya.'],tests:[{i:['80'],o:'Lulus'},{i:['75'],o:'Lulus'},{i:['74'],o:'Tidak lulus'},{i:['0'],o:'Tidak lulus'}]},
{t:'Genap atau ganjil',task:'Baca sebuah bilangan bulat. Tampilkan <code>Genap</code> atau <code>Ganjil</code>.',start:'n = int(input("Bilangan: "))\n',hints:['Operator % menghasilkan sisa bagi.','Genap jika n % 2 == 0'],tests:[{i:['4'],o:'Genap'},{i:['7'],o:'Ganjil'},{i:['0'],o:'Genap'},{i:['-3'],o:'Ganjil'}]},
{t:'Suhu badan',task:'Baca suhu badan (boleh desimal). Jika suhu &ge; 38 tampilkan <code>Demam</code>, selain itu <code>Normal</code>.',start:'suhu = float(input("Suhu: "))\n',hints:['float() dipakai untuk bilangan desimal.','if suhu >= 38:'],tests:[{i:['38'],o:'Demam'},{i:['39.5'],o:'Demam'},{i:['36.6'],o:'Normal'},{i:['37.9'],o:'Normal'}]}]}
];
