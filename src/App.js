import { gapi } from 'gapi-script';
import React from 'react';
import { CSVReader } from 'react-papaparse'
import { mainData } from './data.js'
import { Button } from '@material-ui/core';

const buttonRef = React.createRef()
const SPREADSHEET_ID = '1sad08ntggQL4M4wihOX16ccc6XDqfLgfOeymVVGiX44'; //from the URL of your blank Google Sheet
const CLIENT_ID = '457989737322-uov4qal4k9ir58n96iffedh6h83cvr3u.apps.googleusercontent.com'; //from https://console.developers.google.com/apis/credentials
const API_KEY = 'AIzaSyDX9HSVapiGgzfxo33QH-SMNqmU8CuIOII'; //https://console.developers.google.com/apis/credentials
const SCOPE = 'https://www.googleapis.com/auth/spreadsheets';


export default class ContactForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      datas: '',
      opozdun: '',
      loading: false,
      loadingComplete: false,
      tableReady: false
    }
    
    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.proverochka = this.proverochka.bind(this)
  }

  componentDidMount(){ 
    this.handleClientLoad();   
  }

  handleClientLoad = () => { 
    gapi.load('client:auth2', this.initClient);
  }

  initClient = () => { 
    gapi.client.init({
      'apiKey': API_KEY,
      'clientId': CLIENT_ID,
      'scope': SCOPE,
      'discoveryDocs': ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    }).then(()=> {
      console.log('ok')
    });
  }

  proverochka() {
    this.setState({loading:false})
  }

  onFormSubmit() {
    this.setState({loading: true})
    let peopleTime = this.state.datas
    const date1 = this.state.datas[0].data[0]
    const date2 = this.state.datas[0].data[1]
    const mySplits1 = date1.split(/[.,: -]/);
  const mySplits2 = date2.split(/[.,: -]/);
  var result  = mySplits1.map(function(item) {
    var number = parseInt(item);
    return isNaN(number)? item : number;
  });
  var result2  = mySplits2.map(function(item) {
    var number = parseInt(item);
    return isNaN(number)? item : number;
  });
   if(result[0] < result2[0]){
     result[0]++
     result[1] = 0
   }
  let difference = result2[1] - result[1]
  let opozdal = []
   peopleTime.filter(function(item){
     if(item.data[1] < difference) {
       opozdal.push(item.data[0])
     }
   })
   this.setState({opozdun: opozdal})
    let batchUpdateSpreadsheetRequestBody = {
      requests: [
        {
          "insertDimension": {
            "range": {
              "sheetId": 0,
              "dimension": "COLUMNS",
              "startIndex": 2,
              "endIndex": 3
            },
            "inheritFromBefore": true
          }
        }
      ]
    }
    let parameters = { spreadsheetId: SPREADSHEET_ID}
    let request = gapi.client.sheets.spreadsheets.batchUpdate(parameters, batchUpdateSpreadsheetRequestBody);
    request.then(function(response) {
      console.log(response.result);
    }, function(reason) {
      console.error('error: ' + reason.result.error.message);
    });
  
    let arr = []
    let csvData = this.state.datas
    mainData.forEach(function(item) {
      csvData.forEach(function(items){
        if(item.name === items.data[0]){
            arr.push(item.id+1)
        }
      })
    }
    )
    setTimeout(function(){
    let count = 0
    let i = -1
    setInterval(function(){  
      if (count < arr.length){
        count ++
        i ++
    const params = {
      spreadsheetId: SPREADSHEET_ID,  
    };
    
    const valueRangeBody = {
      "valueInputOption": "RAW",
      "data": [
      {
      "majorDimension": "ROWS",
      "range" : 'Sheet1!C'+ arr[i] + ':C91',
      "values" : [["1"]]
      }
      ]
    };
    let request = gapi.client.sheets.spreadsheets.values.batchUpdate(params, valueRangeBody);
    request.then(function (response) {
      console.log(response.result);
    }, function (reason) {
      console.error('error: ' + reason.result.error.message);
    });
  } else {
    clearInterval()
    this.setState({loading:false})
    this.setState({loadingComplete: true})
  }
  }.bind(this), 400)
}.bind(this), 5000)
  } 





  handleOpenDialog = (e) => {
    if (buttonRef.current) {
      buttonRef.current.open(e)
    }
  }

  handleOnFileLoad = (data) => {
    console.log('---------------------------')
    console.log(data)
    console.log('---------------------------')
    this.setState({datas:data})
    this.setState({tableReady: true})
  }

  handleOnError = (err, file, inputElem, reason) => {
    console.log(err)
  }

  handleOnRemoveFile = (data) => {
    console.log('---------------------------')
    console.log(data)
    console.log('---------------------------')
  }

  handleRemoveFile = (e) => {
    // Note that the ref is set async, so it might be null at some point
    if (buttonRef.current) {
      buttonRef.current.removeFile(e)
    }
  }

  

  render() {
    return (
      <div style={{textAlign:'center'}}>
        <div class="g-signin2" data-onsuccess="onSignIn"></div>
         <>
        <CSVReader
          ref={buttonRef}
          onFileLoad={this.handleOnFileLoad}
          onError={this.handleOnError}
          noClick
          noDrag
          onRemoveFile={this.handleOnRemoveFile}
        >
          {({ file }) => (
            <aside style={{textAlign:'center'}}>
              <Button
                style={{marginBottom:10}}
                color="primary"
                variant="contained"
                type='button'
                onClick={this.handleOpenDialog}
              >
                Загрузить таблицу
              </Button>
              <div
                style={{
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: '#ccc',
                  height: 30,
                  lineHeight: 2.5,
                  marginTop: 5,
                  marginBottom: 5,
                  marginRight: 10,
                  marginLeft: 10,
                  paddingLeft: 13,
                  paddingTop: 3,
                }}
              >
                {file && file.name}
              </div>
            </aside>
          )}
        </CSVReader>
      </>
      {this.state.loadingComplete ? 
      <div>
      <h2>Таблица готова</h2>
      <h2>Опоздали:</h2>
      <ul style={{listStyle:'none', marginLeft:-40}}>
        {this.state.opozdun.map(item=>
        <li>{item}</li>)}
        </ul>
      </div>: null
  }
      {this.state.loading ?
      <div style={{marginTop: 50}}>
        Заполняю таблицу...
      </div> : null
  }
      {this.state.tableReady ?
       <Button 
       style={{marginTop:50}}
       variant="contained" 
       color="primary" 
       onClick={this.onFormSubmit}>
         ПОЕХАЛИ
         </Button> : null
  }
      </div>
    )
  }
}