var textarea = document.getElementById('floatingTextarea');
textarea.spellcheck = false;



function copyText() {
    var textToCopy = document.getElementById("floatingTextarea");
    textToCopy.select();
    document.execCommand("copy");

    var button = document.getElementById("copyButton");
    button.innerHTML = "<b> Copied!</b>";

    setTimeout(function () {
        button.innerHTML = "<b> Copy</b>";
    }, 5000);
}

function showAlert(type, title, message) {
    const alertDiv = document.querySelector('.alert');
    
    // Set alert type class
    alertDiv.classList.add(`alert-${type}`,'show');
    
    // Set alert content
    alertDiv.innerHTML = `
      <strong>${title}</strong>: ${message}
    `;
    
    // Show the alert
    alertDiv.style.display = 'block';
    
    // Hide the alert after 3 seconds
    setTimeout(function() {
      alertDiv.style.display = 'none';
      
      // Remove alert type class
      alertDiv.classList.remove(`alert-${type}`);
      
      // Clear the alert content
      alertDiv.innerHTML = '';
    }, 4000);
  }
  

function handleFile(event) {
    const fileh = event.target.files[0];

    // Get the file extension
    const extension = fileh.name.split('.').pop();

    // Check if the file extension is not 'xlsx' or 'xls'
    if (extension !== 'xlsx' && extension !== 'xls') {
        showAlert('danger', 'Invalid File ⚠️ ', ' Only XL sheets (xlsx or xls) are allowed');
        document.getElementById('inputGroupFile04').value = ''; // Clear the file input value
    }

    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const jsonData = {};

        // Process Account (Page 1)
        const accountWorksheet = workbook.Sheets['Account'];
        if (accountWorksheet) {
            const accountData = XLSX.utils.sheet_to_json(accountWorksheet, { header: 1 });

            const headers = accountData[7];
            const rowData = accountData[8];
            const sheetJson = {};

            headers.forEach((header, index) => {
                sheetJson[header] = rowData[index];
            });

            jsonData['Account'] = sheetJson;

            showAlert('success', 'Valid Xl Sheet ', ' Xl sheet is valid and contains All required sheets.');

        } else {
            showAlert('danger', 'Invalid Xl Sheet ⚠️ ', ' Account sheet not found.');
            document.getElementById('inputGroupFile04').value = ''; // Clear the file input value
            return;
        }

        // Process EndCustomer_psw_is_esker (Page 2)
        const endCustomerWorksheet = workbook.Sheets['EndCustomer_psw_is_esker'];
        if (endCustomerWorksheet) {
            const endCustomerData = XLSX.utils.sheet_to_json(endCustomerWorksheet, { header: 1 });

            const sheetJson = {};
            endCustomerData.forEach(row => {
                const columnA = row[0];
                const columnB = row[1];
                sheetJson[columnA] = columnB;
            });

            jsonData['EndCustomer_psw_is_esker'] = sheetJson;
        } else {
            showAlert('danger', 'Invalid Xl Sheet ⚠️ ', ' EndCustomer_psw_is_esker sheet not found.');
            document.getElementById('inputGroupFile04').value = ''; // Clear the file input value
            return;
        }

        // Process State_master (Page 3)
        const stateMasterWorksheet = workbook.Sheets['State_master'];
        if (stateMasterWorksheet) {
            const stateMasterData = XLSX.utils.sheet_to_json(stateMasterWorksheet, { header: 1 });

            const sheetJson = {};
            stateMasterData.forEach(row => {
                const prefecture = row[0];
                const regionCode = row[1];
                const town = row[2];
                sheetJson[prefecture] = { 'regionCode': regionCode, 'town': town };
            });

            jsonData['State_master'] = sheetJson;
        } else {
            showAlert('danger', 'Invalid Xl Sheet ⚠️ ', ' State_master sheet not found.');
            document.getElementById('inputGroupFile04').value = ''; // Clear the file input value
            return;
        }

        console.log('JSON Data:', jsonData);

        const accountData = jsonData['Account'];
        const lineOfBusinessData = accountData['Line of business'];

        const radioButtons = document.getElementsByName('flexRadioDefault');
        for (let i = 0; i < radioButtons.length; i++) {
            radioButtons[i].checked = false;
            if (radioButtons[i].value.toLowerCase() === lineOfBusinessData.toLowerCase()) {
                radioButtons[i].checked = true;
            }
        }

        // Generate Impex Button Click Event
        document.getElementById("inputGroupFileAddon04").addEventListener("click", function () {
            var selectedRadio = document.querySelector('input[name="flexRadioDefault"]:checked');
            if (selectedRadio) {
                var radioValue = selectedRadio.value;
                var impexFilePath =radioValue + ".impex";

                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        var impexText = xhr.responseText;
                        // Replace placeholders in the impexText
                        impexText = impexText.replace(/<Address Line 1 \(Facility name\)>/g, jsonData['Account']['Address Line 1 (Facility name)']);
                        impexText = impexText.replace(/<Address Line 2>/g, jsonData['Account']['Address Line 2']);
                        impexText = impexText.replace(/<Bill to\?>/g, jsonData['Account']['Bill to?']);
                        impexText = impexText.replace(/<City>/g, jsonData['Account']['City']);
                        impexText = impexText.replace(/<Contact address\?>/g, jsonData['Account']['Contact address?']);
                        impexText = impexText.replace(/<Country>/g, jsonData['Account']['Country']);
                        impexText = impexText.replace(/<Customer Name-Japanese>/g, jsonData['Account']['Customer Name-Japanese']);
                        impexText = impexText.replace(/<JSST#>/g, jsonData['Account']['JSST#']);
                        impexText = impexText.replace(/<Oracle #>/g, jsonData['Account']['Oracle #']);
                        impexText = impexText.replace(/<Oracle Ship to Location ID>/g, jsonData['Account']['Oracle Ship to Location ID']);
                        impexText = impexText.replace(/<Oracle bill to location ID>/g, jsonData['Account']['Oracle bill to location ID']);
                        impexText = impexText.replace(/<Phone number \(mandatory for ship to\)>/g, jsonData['Account']['Phone number (mandatory for ship to)']);
                        impexText = impexText.replace(/<Postal code \(without -\)>/g, jsonData['Account']['Postal code (without -)']);
                        // impexText = impexText.replace(/<Prefecture>/g, jsonData['Account']['Prefecture']);
                        impexText = impexText.replace(/<Primary bill to\/ship to>/g, jsonData['Account']['Primary bill to/ship to']);
                        impexText = impexText.replace(/<Primary bill to\?>/g, jsonData['Account']['Primary bill to?']);
                        impexText = impexText.replace(/<Primary ship to\?>/g, jsonData['Account']['Primary ship to?']);
                        impexText = impexText.replace(/<Ship to\?>/g, jsonData['Account']['Ship to?']);
                        impexText = impexText.replace(/<UCM ID>/g, jsonData['Account']['UCM ID']);

                        // Perform the necessary placeholder replacements in the impexText
                        // Replace '<UCM ID>' with the actual UCM ID value, and so on
                        // Replace <Prefecture> with regionCode from State_master sheet
                        if (jsonData['State_master']) {
                            const prefecture = jsonData['Account']['Prefecture'];
                            const stateMasterData = jsonData['State_master'];

                            if (stateMasterData[prefecture]) {
                                const regionCode = stateMasterData[prefecture]['regionCode'];
                                impexText = impexText.replace(/<Prefecture>/g, regionCode);
                            } else {
                                showAlert('warning', 'Data Error ⚠️ ', ` Region code not found for prefecture: ${prefecture}`);
                            }
                        } else {
                            showAlert('warning', 'Data Error ⚠️ ', ` State_master data not available`);
                        }


                        // Display the filled impex text in the textarea
                        const textarea = document.getElementById('floatingTextarea');
                        textarea.value = impexText;
                        showAlert('success', 'Congrats 🎉 ', ` Impex Successfully Generated.`);
                    } else if (xhr.readyState === 4 && xhr.status !== 200) {
                        // Error handling if impex file retrieval fails
                        showAlert('warning', 'Missing Impex File ⚠️ ', ` Failed to retrieve the impex file.`);
                    }
                };
                xhr.open("GET", impexFilePath, true);
                xhr.send();
            } else {
                // No radio button is selected
                // Handle this case accordingly
                showAlert('warning', 'Line Of Business ⚠️ ', ` No radio button is selected.`);
            }
        });

    };


    reader.readAsArrayBuffer(file);
}

