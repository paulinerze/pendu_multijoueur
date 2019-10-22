import React, { Component } from 'react';
import { Button } from 'react-bootstrap'
import './App.css';
import Canvas from "./Canvas.jsx";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errorsJ1: 0,
      errorsJ2: 0,
      word: 'abc',
      alphabet : ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"],
      wordList2: [],
      usedLetters: [],
      uselessUsedLetters: [],
      players:['Joueur 1','Joueur 2'],
      currentPlayer: 'Joueur 1',
      start: true,
      nbWinJ1: 0,
      nbLooseJ1: 0,
      nbWinJ2: 0,
      nbLooseJ2: 0
    };
    this.randomWord = this.randomWord.bind(this);
    this.incrementerrors = this.incrementerrors.bind(this);
    this.isReadyToPlayAgain = this.isReadyToPlayAgain.bind(this);
    this.handleAlphabetClick = this.handleAlphabetClick.bind(this);
    this.computeDisplay = this.computeDisplay.bind(this);
    this.doMatch = this.doMatch.bind(this);
    this.handleGameManagerClick = this.handleGameManagerClick.bind(this);
    this.removeAccents = this.removeAccents.bind(this);
    this.manageWordList = this.manageWordList.bind(this);
    this.deleteMultipleOcc = this.deleteMultipleOcc.bind(this);
    this.transformToLowerCase = this.transformToLowerCase.bind(this);
  }

  deleteMultipleOcc(myarray){
    let i, j, len = myarray.length, out = [], obj = {};
    for (i = 0; i < len; i++) {
      obj[myarray[i]] = 0;
    }
    for (j in obj) {
      out.push(j);
    }
    return out
  }

  transformToLowerCase(myarray){
    let out = []
    for (let i = 0; i < myarray.length; i++) {
      const element = myarray[i];
      let elementLowerCase = element.toLowerCase();
      out.push(elementLowerCase)
    }
    return out
  }

  manageWordList(){
    let myarray = []
    for (let i = 0; i < this.state.wordList2.length; i++) {
      let element = this.state.wordList2[i];
      element = this.removeAccents(element)
      element = element.replace(new RegExp(",+","g"),"")
      let matchResult = []
      if ((matchResult = element.match(new RegExp("[A-Z]+[a-z]+","g")))) {
        myarray.push(...matchResult)        
      }
    }

    let out = this.deleteMultipleOcc(myarray)
    out = this.transformToLowerCase(out)
        
    return out
  }

  removeAccents(str) {
    let accents    = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž';
    let accentsOut = "AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz";
    str += ''
    str = str.split('');
    let strLen = str.length;
    let i, x;
    for (i = 0; i < strLen; i++) {
      if ((x = accents.indexOf(str[i])) !== -1) {
        str[i] = accentsOut[x];
      }
    }
    return str.join('');    
  }

  componentDidMount() {
    fetch('https://data.nantesmetropole.fr/api/records/1.0/search/?dataset=244400404_agenda-evenements-nantes-nantes-metropole&rows=10&facet=emetteur&facet=rubrique&facet=lieu&facet=villenplaceholder.typicode.com/users')
    .then(res => res.json()) 
    .then((data) => {
      this.setState({ wordList2: data.records.map(record => record.fields.type)})
    })
      
  }

   randomWord(){
    let wordList = sessionStorage.getItem("wordList");
    wordList = JSON.parse(wordList);
    let rand = 0 + Math.random() * (this.state.wordList2.length - 0);
    this.setState({word: wordList[Math.round(rand)]}); 
   }


  incrementerrors (){
    console.log(this.state.currentPlayer)
    if (this.state.currentPlayer === "Joueur 1") {
      let futureStateErrors = this.state.errorsJ1 +1;
      if(futureStateErrors > 9) this.isReadyToPlayAgain();
      this.setState({errorsJ1: futureStateErrors});
      this.setState({currentPlayer : "Joueur 2"})
    } else {
        let futureStateErrors = this.state.errorsJ2 +1;
        if(futureStateErrors > 9) this.isReadyToPlayAgain();
        this.setState({errorsJ2: futureStateErrors});
        this.setState({currentPlayer : "Joueur 1"})
    }
  }

  isReadyToPlayAgain(){
    if (this.state.word.length === this.state.usedLetters.length+1) {
      this.state.currentPlayer === "Joueur 1" ? this.setState({nbWinJ1: this.state.nbWinJ1+1}) : this.setState({nbWinJ2: this.state.nbWinJ2+1})
    } else {
      this.state.currentPlayer === "Joueur 1" ? this.setState({nbLooseJ1: this.state.nbLooseJ1+1}) : this.setState({nbLooseJ1: this.state.nbLooseJ2+1})
    }
    this.setState({start: true});
  }

  handleAlphabetClick (letter){
    if (this.state.word.length === this.state.usedLetters.length+1){
      this.isReadyToPlayAgain();
      this.doMatch(letter);
    } else if (this.state.errorsJ1 < 11 && this.state.errorsJ2 < 11) {
      this.doMatch(letter);
    } else {
      this.isReadyToPlayAgain();
    }
  }

  computeDisplay(word, usedLetters){
    return word.replace(/\w/g,
      (letter) => (usedLetters.includes(letter) ? letter : '_')
    )
  }

  doMatch(theLetter){
    let l = theLetter.toString();
    if (this.state.word.includes(theLetter)){ //si le mot contient la lettre
      let nbOcc = this.state.word.match(new RegExp(theLetter,"gi")).length 
      if (!this.state.usedLetters.includes(l)) { //si la lettre n'a pas déjà été utilisée

        switch (nbOcc) {
          case 1:
            this.setState({usedLetters: this.state.usedLetters.concat(l)});
            break;
          case 2:
            this.setState({usedLetters: this.state.usedLetters.concat(l,l)});
            break;
          case 3:
            this.setState({usedLetters: this.state.usedLetters.concat(l,l,l)});
            break;
          case 4:
            this.setState({usedLetters: this.state.usedLetters.concat(l,l,l,l)});
            break;
          default:
            break;
        }  
      } else {
        this.setState({uselessUsedLetters: this.state.uselessUsedLetters.concat(l)})
        this.incrementerrors();
      }
    } else {
      this.setState({uselessUsedLetters: this.state.uselessUsedLetters.concat(l)})
      this.incrementerrors();
    }
  }

  handleGameManagerClick(){
    if ((this.state.nbWinJ1 < 1 && this.state.nbLooseJ1 < 1) && (this.state.nbWinJ2 < 1 && this.state.nbLooseJ2 < 1) ) {
      let wordList = this.manageWordList();
      wordList = JSON.stringify(wordList);
      sessionStorage.setItem("wordList",wordList);
    }

    this.setState({start: false}); 
    this.setState({errorsJ1: 0});
    this.setState({errorsJ2: 0});
    this.setState({usedLetters: []});
    this.setState({uselessUsedLetters: []});
    this.randomWord();
    this.letterInput.focus();  
  }

  handleChange = ({target: {value} }) => {
    value = value.toLowerCase();
    this.handleAlphabetClick(value);
    value="";
  }

   

  render() {  
    
    const GameManager = () => {
      let disableButton = !this.state.start;
      return <p><Button disabled={disableButton} onClick={this.handleGameManagerClick}>{"Jouer"}</Button></p>
    }
    
    const ScoreBoard = () => {
      return <div>
      <table>
        <thead>
          <tr>
            <th>{"Joueur 1"}</th>
            <th>{"Joueur 2"}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{"Nombre de victoire(s) joueur 1 : " + this.state.nbWinJ1}</td>
            <td>{"Nombre de victoire(s) joueur 2 : " + this.state.nbWinJ2}</td>
          </tr>
          <tr>
            <td>{"Nombre de défaite(s) joueur 1 : " + this.state.nbLooseJ1}</td>
            <td>{"Nombre de défaite(s) joueur 2 : " + this.state.nbLooseJ2}</td>
          </tr>
          <tr>
            <td>{"Nombre d'erreurs joueur 1 : "+ this.state.errorsJ1}</td>
            <td>{"Nombre d'erreurs joueur 2 : "+ this.state.errorsJ2}</td>
          </tr>
        </tbody>
      </table>
      <p>{"C'est au tour du " + this.state.currentPlayer}</p> 
      </div>
    }
    
    const GuessList = () => {
      const guessList = "Mot à deviner : " + this.computeDisplay(this.state.word,this.state.usedLetters);
      return(
        <ul>{guessList}</ul>
      )      
    }

    const PenduJ1 = () => {
      return <Canvas errors={this.state.errorsJ1}/> 
    }

    const PenduJ2 = () => {
      return <Canvas errors={this.state.errorsJ2}/> 
    }

    const Results = () => {
      if(this.state.errorsJ1 > 9){
        return <p>{"Le joueur 1 est un looser"}</p>
      }
      if(this.state.errorsJ2 > 9){
        return <p>{"Le joueur 2 est un looser"}</p>
      }
      if(this.state.word.length === this.state.usedLetters.length){
        if(this.state.currentPlayer === "Joueur 1"){
          return <p>{"Le joueur 1 est un winner"}</p>
        } else return <p>{"Le joueur 2 est un winner"}</p>
      }
  
      return <p></p>
    }

    
    return (
      <React.Fragment>
        <div>
          <PenduJ1/>
          <PenduJ2/>
        </div>
        <div>
          <GameManager/>
          <ScoreBoard/>
          <Results/>
          <GuessList/>
        </div>
        <div>
          <input ref={(input) => {this.letterInput = input;}} onChange={this.handleChange} value=""/>
        </div>
      </React.Fragment>                          
    );
  }
}

export default App;
