const express = require('express')
const path = require('path');
const http = require('http')
const PORT = process.env.PORT || 5000
const app = express()
const server = http.createServer(app)
const cors = require('cors');
const fs = require('fs')
const multer = require('multer')
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const iconv = require('iconv-lite');


app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//במידה ואני רוצה להגיש את הצד לקוח דרך השרת
app.use(express.static(path.join(__dirname, 'client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

app.post('/upload_file', upload.single('file.txt'), function (req, res) {
  const type_system = req.body.type_system;
  console.log(type_system);
  const file = req.file;
  if (file) {
    const multerText = iconv.decode(Buffer.from(file.buffer), 'ISO-8859-8');
    data_extracted = multerText.split("\r\n");

    if (type_system == "webenefit") {
      for (let i = 0; i < data_extracted.length; i++) {
        if (data_extracted[i].slice(0, 4) == 'B100') {

          //מחיקת טקסט משדה אסמכתא
          const check_char = (data) => {
            for (let j = 60; j < 81; j++) {
              if (/^[a-zA-Zא-ת]$/.test(data[j])) {
                return true;
              }
            }
          }

          if (check_char(data_extracted[i])) {
            data_extracted[i] = data_extracted[i].slice(0, 60) + "                    " + data_extracted[i].slice(80, 318)
            console.log(data_extracted[i]);
          };

          //שינוי סדר השדות בפקודות הכנסה
          if (data_extracted[i].slice(36, 37) == '1'
            && data_extracted[i].slice(202, 203) == '1' && data_extracted[i + 1].slice(202, 203) == '2') {

            if (data_extracted[i + 2].slice(36, 37) == '3') {
              let temp = data_extracted[i];
              data_extracted[i] = data_extracted[i + 1];
              data_extracted[i + 1] = data_extracted[i + 2];
              data_extracted[i + 2] = temp;
            }

            else if (data_extracted[i + 2].slice(36, 37) == '1' || data_extracted[i + 2].slice(36, 37) == '2') {
              let temp = data_extracted[i];
              data_extracted[i] = data_extracted[i + 1];
              data_extracted[i + 1] = temp;
            }

          }
        }
      }
    }

    if (type_system == "hashavshevet") {

      for (let i = 0; i < data_extracted.length; i++) {
        if (data_extracted[i].slice(0, 4) == 'B100') {

          //שינוי סדר השדות בפקודות הכנסה (2-1-2)
          if (data_extracted[i].slice(202, 203) == '2' &&
            data_extracted[i + 1].slice(202, 203) == '1' &&
            data_extracted[i + 2].slice(202, 203) == '2'

            && data_extracted[i].slice(22, 32) == data_extracted[i + 1].slice(22, 32) &&
            data_extracted[i + 1].slice(22, 32) == data_extracted[i + 2].slice(22, 32)
          ) {
            let temp = data_extracted[i + 1];
            data_extracted[i + 1] = data_extracted[i + 2];
            data_extracted[i + 2] = temp;
          }

          //שינוי סדר השדות בפקודות הכנסה (1 - 2 - 2)
          if (data_extracted[i].slice(202, 203) == '1' &&
            data_extracted[i + 1].slice(202, 203) == '2' &&
            data_extracted[i + 2].slice(202, 203) == '2' 

            && data_extracted[i].slice(22, 32) == data_extracted[i + 1].slice(22, 32) &&
            data_extracted[i + 1].slice(22, 32) == data_extracted[i + 2].slice(22, 32)
          ) {
            let temp = data_extracted[i];
            data_extracted[i] = data_extracted[i + 1];
            data_extracted[i + 1] = data_extracted[i + 2];
            data_extracted[i + 2] = temp;
          }

          //שמירה במערך את השורה השניה של הוצאות פטורות לצורך מחיקה
          if (data_extracted[i].slice(202, 203) == '1' &&
            data_extracted[i + 1].slice(202, 203) == '2'

            && data_extracted[i].slice(22, 32) == data_extracted[i + 1].slice(22, 32) &&
            data_extracted[i].slice(22, 32) !== data_extracted[i + 2].slice(22, 32) && 
            data_extracted[i].slice(22, 32) !== data_extracted[i - 1].slice(22, 32)
          ) {
            data_extracted[i + 1] = data_extracted[i + 1].slice(0, 203) + "1" + data_extracted[i + 1].slice(203, 206) 
            + "00000000000000" + data_extracted[i + 1].slice(222, 318)
          }

        }
      }
    }

    let invoice;

    for (let i = 0; i < data_extracted.length; i++) {
      invoice += (data_extracted[i]);
      invoice += "\r\n";
    }

    const encodedData = iconv.encode(invoice, 'ISO-8859-8');

    fs.writeFile('images/temp.txt', encodedData, err => {
      if (err) {
        console.error(err);
      } else {
        res.sendFile(path.join(__dirname + '/images/temp.txt'));

        // file written successfully
        console.log("success");
      }
    });
  }
  else (res.send("יש לצרף קובץ"));
});

server.listen(PORT, err => {
  if (err) console.log(err)
  console.log('Server running on Port ', PORT)
})
