function doGet(e) {
  var action = e.parameter.action;
  
  if(action == 'getDashboard') {
    return getDashboard();
  } else if(action == 'getPemasukan') {
    return getSheetData('PEMASUKAN');
  } else if(action == 'getPengeluaran') {
    return getSheetData('PENGELUARAN');
  } else if(action == 'getKategoriPemasukan') {
    return getSheetData('KATEGORI_PEMASUKAN');
  } else if(action == 'getKategoriPengeluaran') {
    return getSheetData('KATEGORI_PENGELUARAN');
  } else if(action == 'getSaldoKas') {
    return getSheetData('SALDO_KAS');
  } else if(action == 'getKegiatan') {
    return getSheetData('KEGIATAN');
  } else if(action == 'getUsers') {
    return getSheetData('USER');
  }
  
  return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Invalid action'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  // Tangkap error jika postData kosong
  if (!e || !e.postData || !e.postData.contents) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'No Data Received'}))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var data = JSON.parse(e.postData.contents);
  var action = data.action;
  
  if(action == 'login') {
    return doLogin(data.username, data.password);
  } else if (action == 'addPemasukan') {
    return addData('PEMASUKAN', data.payload);
  } else if (action == 'addPengeluaran') {
    return addData('PENGELUARAN', data.payload);
  } else if (action == 'addKegiatan') {
    return addData('KEGIATAN', data.payload);
  } else if (action == 'addUser') {
    return addData('USER', data.payload);
  } else if (action == 'deletePemasukan') {
    return deleteData('PEMASUKAN', data.id);
  } else if (action == 'deletePengeluaran') {
    return deleteData('PENGELUARAN', data.id);
  } else if (action == 'deleteKegiatan') {
    return deleteData('KEGIATAN', data.id);
  } else if (action == 'deleteUser') {
    return deleteData('USER', data.id);
  } else if (action == 'editPemasukan') {
    return editData('PEMASUKAN', data.payload);
  } else if (action == 'editPengeluaran') {
    return editData('PENGELUARAN', data.payload);
  } else if (action == 'editKegiatan') {
    return editData('KEGIATAN', data.payload);
  } else if (action == 'editUser') {
    return editData('USER', data.payload);
  }
  
  return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Invalid action'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheetData(sheetName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if(!sheet) return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Sheet not found'})).setMimeType(ContentService.MimeType.JSON);
  
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  
  if (lastRow < 2 || lastCol === 0) {
    return ContentService.createTextOutput(JSON.stringify({status: 'success', data: []})).setMimeType(ContentService.MimeType.JSON);
  }

  // Hanya membaca data yang valid, menghindari baris/kolom kosong tak terbatas
  var data = sheet.getRange(1, 1, lastRow, lastCol).getValues();

  var headers = data[0];
  var result = [];
  
  for(var i = 1; i < data.length; i++) {
    var obj = {};
    for(var j = 0; j < headers.length; j++) {
      obj[headers[j]] = data[i][j];
    }
    result.push(obj);
  }
  
  return ContentService.createTextOutput(JSON.stringify({status: 'success', data: result}))
    .setMimeType(ContentService.MimeType.JSON);
}

function getDashboard() {
  var sheetSaldo = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SALDO_KAS');
  var sheetPemasukan = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('PEMASUKAN');
  var sheetPengeluaran = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('PENGELUARAN');
  
  var saldoAkhir = 0;
  if(sheetSaldo && sheetSaldo.getLastRow() > 1) {
    var dataSaldo = sheetSaldo.getRange(sheetSaldo.getLastRow(), 6).getValue();
    saldoAkhir = Number(dataSaldo) || 0;
  }
  
  var totalPemasukan = 0;
  var monthlyPemasukan = [0,0,0,0,0,0,0,0,0,0,0,0];
  if(sheetPemasukan && sheetPemasukan.getLastRow() > 1) {
    var dataPemasukan = sheetPemasukan.getRange(2, 1, sheetPemasukan.getLastRow() - 1, 6).getValues();
    for(var i=0; i<dataPemasukan.length; i++){
      var nominal = Number(dataPemasukan[i][5]) || 0;
      totalPemasukan += nominal; 
      
      var d = new Date(dataPemasukan[i][1]); // kolom tanggal (index 1)
      if(!isNaN(d.getTime())) {
        var month = d.getMonth(); // 0-11
        // Optional: filter by current year if needed. We assume all data or just accumulate by month.
        if (d.getFullYear() === new Date().getFullYear()) {
          monthlyPemasukan[month] += nominal;
        }
      }
    }
  }
  
  var totalPengeluaran = 0;
  var monthlyPengeluaran = [0,0,0,0,0,0,0,0,0,0,0,0];
  if(sheetPengeluaran && sheetPengeluaran.getLastRow() > 1) {
    var dataPengeluaran = sheetPengeluaran.getRange(2, 1, sheetPengeluaran.getLastRow() - 1, 6).getValues();
    for(var i=0; i<dataPengeluaran.length; i++){
      var nominal = Number(dataPengeluaran[i][5]) || 0;
      totalPengeluaran += nominal; 
      
      var d = new Date(dataPengeluaran[i][1]); // kolom tanggal (index 1)
      if(!isNaN(d.getTime())) {
        var month = d.getMonth(); // 0-11
        if (d.getFullYear() === new Date().getFullYear()) {
          monthlyPengeluaran[month] += nominal;
        }
      }
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success', 
    data: {
      totalSaldo: saldoAkhir,
      totalPemasukan: totalPemasukan,
      totalPengeluaran: totalPengeluaran,
      monthlyPemasukan: monthlyPemasukan,
      monthlyPengeluaran: monthlyPengeluaran
    }
  })).setMimeType(ContentService.MimeType.JSON);
}

function doLogin(username, password) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('USER');
  if(!sheet) return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Sheet USER belum ada'})).setMimeType(ContentService.MimeType.JSON);

  var data = sheet.getDataRange().getValues();
  
  if (data.length < 2) {
     return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Database USER masih kosong. Silakan jalankan initSpreadsheet() di Apps Script.'})).setMimeType(ContentService.MimeType.JSON);
  }

  for(var i=1; i<data.length; i++) {
    if(data[i][2] == username && data[i][3] == password) { 
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        user: {
          id_user: data[i][0],
          nama: data[i][1],
          username: data[i][2],
          level: data[i][4],
          status: data[i][5]
        }
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Username atau Password salah'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function updateSaldoKas() {
  var sheetSaldo = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SALDO_KAS');
  var sheetPemasukan = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('PEMASUKAN');
  var sheetPengeluaran = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('PENGELUARAN');

  var pemLastRow = sheetPemasukan.getLastRow();
  var pengLastRow = sheetPengeluaran.getLastRow();

  var totalPem = 0;
  if (pemLastRow > 1) {
    // Hanya ambil kolom F (index 6, Nominal) mulai baris 2 untuk mempercepat pembacaan
    var pemData = sheetPemasukan.getRange(2, 6, pemLastRow - 1, 1).getValues();
    for(var i=0; i<pemData.length; i++){ totalPem += Number(pemData[i][0] || 0); }
  }

  var totalPeng = 0;
  if (pengLastRow > 1) {
    // Hanya ambil kolom F (index 6, Nominal) mulai baris 2
    var pengData = sheetPengeluaran.getRange(2, 6, pengLastRow - 1, 1).getValues();
    for(var i=0; i<pengData.length; i++){ totalPeng += Number(pengData[i][0] || 0); }
  }

  var saldoAkhir = totalPem - totalPeng;
  
  sheetSaldo.getRange("A2:F2").setValues([
    ["SLD-" + new Date().getTime(), new Date(), 0, totalPem, totalPeng, saldoAkhir]
  ]);
}

function addData(sheetName, payload) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var lastCol = sheet.getLastColumn();
  
  if (lastCol === 0) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Sheet kosong atau header belum disetup'}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var row = [];
  
  for(var i=0; i<headers.length; i++) {
    row.push(payload[headers[i]] || "");
  }
  
  sheet.appendRow(row);
  
  // Trigger update Saldo hanya jika sheet yang diupdate berkaitan dengan saldo
  if(sheetName === 'PEMASUKAN' || sheetName === 'PENGELUARAN') {
    updateSaldoKas();
  }
  
  return ContentService.createTextOutput(JSON.stringify({status: 'success', message: 'Data berhasil ditambahkan'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function deleteData(sheetName, id) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if(!sheet) return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Sheet not found'})).setMimeType(ContentService.MimeType.JSON);
  
  var data = sheet.getDataRange().getValues();
  for(var i=1; i<data.length; i++) {
    if(data[i][0] == id) {
      sheet.deleteRow(i + 1);
      if(sheetName === 'PEMASUKAN' || sheetName === 'PENGELUARAN') {
        updateSaldoKas();
      }
      return ContentService.createTextOutput(JSON.stringify({status: 'success', message: 'Data berhasil dihapus'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Data tidak ditemukan'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function editData(sheetName, payload) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  
  if (lastRow < 2 || lastCol === 0) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Sheet kosong'}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  var data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var headers = data[0];
  var idColumnName = headers[0]; // Asumsi kolom pertama selalu ID
  var targetId = payload[idColumnName];
  
  for(var i=1; i<data.length; i++) {
    if(data[i][0] == targetId) {
      var rowArray = [];
      for(var j=0; j<headers.length; j++) {
        rowArray.push(payload[headers[j]] !== undefined ? payload[headers[j]] : data[i][j]);
      }
      
      // Update baris tersebut
      sheet.getRange(i + 1, 1, 1, lastCol).setValues([rowArray]);
      
      if(sheetName === 'PEMASUKAN' || sheetName === 'PENGELUARAN') {
        updateSaldoKas();
      }
      return ContentService.createTextOutput(JSON.stringify({status: 'success', message: 'Data berhasil diupdate'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Data tidak ditemukan'}))
    .setMimeType(ContentService.MimeType.JSON);
}

// =========================================================================
// FUNGSI INIT SPREADSHEET (JALANKAN INI SEKALI SAJA)
// =========================================================================
function initSpreadsheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var sheetsData = {
    'USER': [
      ['id_user', 'nama', 'username', 'password', 'level', 'status'],
      ['USR-1', 'Admin NU', 'admin', 'admin', 'Admin', 'Aktif']
    ],
    'KATEGORI_PEMASUKAN': [
      ['id_kat_masuk', 'nama_kategori'],
      ['UPZIS NU', 'UPZIS NU'],
      ['Lembaga Eksternal', 'Lembaga Eksternal'],
      ['Donatur', 'Donatur'],
      ['Hibah', 'Hibah'],
      ['Iuran', 'Iuran'],
      ['Lain-lain', 'Lain-lain']
    ],
    'PEMASUKAN': [
      ['id_masuk', 'tanggal', 'id_kat_masuk', 'sumber_dana', 'uraian', 'nominal', 'bukti', 'input_by']
    ],
    'KATEGORI_PENGELUARAN': [
      ['id_kat_keluar', 'nama_kategori'],
      ['Operasional', 'Operasional'],
      ['ATK', 'ATK'],
      ['Sarana Prasarana', 'Sarana Prasarana'],
      ['Barang Habis Pakai', 'Barang Habis Pakai'],
      ['Kegiatan', 'Kegiatan'],
      ['Sosial', 'Sosial'],
      ['Transportasi', 'Transportasi'],
      ['Konsumsi', 'Konsumsi'],
      ['Administrasi Bank', 'Administrasi Bank'],
      ['Lain-lain', 'Lain-lain']
    ],
    'PENGELUARAN': [
      ['id_keluar', 'tanggal', 'id_kat_keluar', 'penerima', 'uraian', 'nominal', 'bukti', 'input_by']
    ],
    'SALDO_KAS': [
      ['id_saldo', 'tanggal', 'saldo_awal', 'total_masuk', 'total_keluar', 'saldo_akhir']
    ],
    'KEGIATAN': [
      ['id_kegiatan', 'nama_kegiatan', 'tanggal_mulai', 'tanggal_selesai', 'penanggung_jawab']
    ]
  };

  for (var sheetName in sheetsData) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    } else {
      sheet.clear(); // Bersihkan jika sudah ada
    }
    
    // Set data (header dan initial data)
    var rows = sheetsData[sheetName];
    sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
    
    // Warnai header agar rapi
    sheet.getRange(1, 1, 1, rows[0].length).setBackground('#0d9488').setFontColor('white').setFontWeight('bold');
  }

  Browser.msgBox("SUKSES!", "Semua Header dan Data Awal berhasil dibuat. Anda sekarang bisa login menggunakan username: admin dan password: admin.", Browser.Buttons.OK);
}
