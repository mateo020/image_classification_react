
import './App.css';
import * as tf from '@tensorflow/tfjs'
import * as mobilenet from '@tensorflow-models/mobilenet';
import { useReducer, useState, useRef} from 'react';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { BallTriangle } from  'react-loader-spinner'
import { Grid } from  'react-loader-spinner'
import Header from './header';

const StateMachine = {
  initial: 'initial',
  states: {
    initial: {on: {next: 'loadingModel'}},
    loadingModel: {on: {next: 'awaitingUpload', showTriangle: true}},
    awaitingUpload:{on: {next: 'ready'}, showGrid: true},
    ready: {on: {next: 'classifying'}, showImage: true},
    classifying:{on: {next: 'complete'}},
    complete: {on: {next: 'awaitingUpload'},showImage: true, showResults: true},

  }
 
}

const reducer = (currentState, event) => StateMachine.states[currentState].on[event] || StateMachine.initial;



const formatResult = ({className, probability}) => (
  <li key={className}>
   {`${className}: %${(probability * 100).toFixed(2)}`}
  </li>


);

function App() {
  const next = () => dispatch('next')

  const[state, dispatch] = useReducer(reducer, StateMachine.initial);
  const [model, setModel] = useState(null);
  
  const [ imageUrl, setImageUrl] = useState(null);

  const [results, setResults]= useState([]);
  const inputRef = useRef();
  const imageRef = useRef();


  const loadModel = async() =>  {
    next()
    const mobileModel = await mobilenet.load()
    setModel(mobileModel);
    next();

  }

  const handleUpload= e => {
    const{files} = e.target;
    if (files.length > 0){
      const url = URL.createObjectURL(files[0]);
      setImageUrl(url);
      next();

    }
  }

  const indentify = async() => {
    next();
    const results = await model.classify(imageRef.current);
    setResults(results)
    next();

  }

  const reset = () => {
    setResults([])
    setImageUrl(null)
    next();
  }
  const buttonProps = {
    initial: { text: 'Load Model', action: loadModel},
    loadingModel: {text: 'Loading model...', action: () => {}},
    awaitingUpload: {text: 'Upload Photo', action: () => inputRef.current.click()},
    ready: {text: 'Identify', action: indentify},
    classifying: {text: 'Identifying', action: () => {}},
    complete: {text: 'reset', action: reset}

  }

  const{showImage = false, showResults = false, showGrid = false, showTriangle = false } = StateMachine.states[state];
  return (
    
      <div>
      <Header/>
      {showTriangle && 
      <BallTriangle color="#00BFFF" height={80} width={80} />
      }

      {showGrid &&
      <Grid color="#00BFFF" height={80} width={80} />
      
      }


      
      {showImage && <img alt='up-load preview' src={imageUrl} ref= {imageRef} />}
      {showResults && <ul>
        {results.map(formatResult)}
      </ul>}
      <input type="file" accept='image/*' capture="camera" ref={inputRef} onChange={handleUpload}/>
    <button onClick={buttonProps[state].action}>{buttonProps[state].text}</button>
    </div>
  
    
  
  );
}

export default App;
