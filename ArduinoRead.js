//App that read the arduino with GPS Shield and save in mysql
const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");
const mariadb = require('mariadb');

function savedb(MSJ) {
const pool = mariadb.createPool({
     host: '192.168.1.20', 
     port: '30006',
     user:'root', 
     password: 'admin',
     connectionLimit: 5
});
pool.getConnection()
    .then(conn => {
      console.log(MSJ)
      conn.query("INSERT INTO MAIN_DB.ARDUINO (FECHA_HORA,  LATITUD, LONGITUD, VELOCIDAD, "+
      "AN0,AN1,AN2,AN3,AN4,AN5 ) "+
      "VALUE (? ,? ,? ,? ,? ,? ,? ,? ,? ,? )", 
      [MSJ.FECHA_HORA, 
      MSJ.LATITUD, 
      MSJ.LONGITUD, 
      MSJ.VELOCIDAD,
      MSJ.AN0,
      MSJ.AN1,
      MSJ.AN2,
      MSJ.AN3,
      MSJ.AN4,
      MSJ.AN5,
    ])
    .then((res) =>{
      //console.log(res);
      conn.end();
    })
    .catch(err =>{
    //console.log(err);
    conn.query("CREATE TABLE MAIN_DB.ARDUINO (" +
    "id INT NOT NULL AUTO_INCREMENT," +
    "FECHA_HORA DATETIME NOT NULL," +
    "LATITUD FLOAT NOT NULL,"+
    "LONGITUD FLOAT NOT NULL," +
    "VELOCIDAD FLOAT NOT NULL,"+
    "AN0 FLOAT NOT NULL,"+
    "AN1 FLOAT NOT NULL,"+
    "AN2 FLOAT NOT NULL,"+
    "AN3 FLOAT NOT NULL,"+
    "AN4 FLOAT NOT NULL,"+
    "AN5 FLOAT NOT NULL,"+
    "PRIMARY KEY (id))")
    })
    .then((res) =>{
      console.log(res);
      conn.end();
    })
    .catch(err =>{
      //console.log(err);
    })
    
  }).catch(err => {
      //not connected
    });
  }

  

async function ReadArduino(){
  list = await SerialPort.list();
  path = list[0].path;
  port = await new SerialPort(path, { baudRate: 9600 });
  parser = await port.pipe(new Readline({ delimiter: "\n" }));
  await parser.on("data", (data) => {
  var elemento = AjusteWord(data);
  savedb(elemento);
})
  setInterval(() => port.write("hello from node\n"), 2000);
}


function AjusteWord(word) {
  var newword, MSG;
  newword = word.split("|");
  MSG = {
    FECHA_HORA: new Date(),
    LATITUD: newword[0].split("=")[1],
    LONGITUD: newword[1].split("=")[1],
    VELOCIDAD: newword[2].split("=")[1],
    AN0: newword[4].split("=")[1],
    AN1: newword[5].split("=")[1],
    AN2: newword[6].split("=")[1],
    AN3: newword[7].split("=")[1],
    AN4: newword[8].split("=")[1],
    AN5: newword[9].split("=")[1].trimRight("\r"),
  };
  return MSG;
}

ReadArduino();

//module.exports.ReadArduino = ReadArduino;