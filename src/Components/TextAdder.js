import React, { useState } from "react";
import classes from "../Styles/TextAdder.module.css";
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
} from "firebase/firestore";
import db from "../FIrebase/Firebase";

const TextAdder = () => {
  const [inputText, setInputText] = useState("");

  const onInputChangeHandler = (e) => {
    setInputText(e.target.value);
  }

  const onCLickHandler = async () => {
    try {
      //Transaction operation for Adding new item to List
      await runTransaction(db, async (transaction) => {
        //Getting last document index
        const dbRefs = await collection(db, "List");

        const q = query(dbRefs, orderBy("index", "desc"), limit(1));
        const querySnapshot = await getDocs(q);
        let lastIndex;
        querySnapshot.forEach((doc) => {
          lastIndex = doc.data().index;
        });

        if(!lastIndex && lastIndex !== 0){
          await addDoc(collection(db, "List"), {
            Text: inputText,
            index: 0 ,
            isPinned : false
          });
        }else{
          await addDoc(collection(db, "List"), {
            Text: inputText,
            index: Number(lastIndex) + 1,
            isPinned : false
          });
        }
        
        setInputText("");

      });
      // console.log("Transaction successfully committed!");
    } catch (e) {
      console.log("Transaction failed: ", e);
    }
  };

  return (
    <div className={classes.mainDiv}>
      <div className={classes.inputDiv}>
        <input type="text" value={inputText} onChange={onInputChangeHandler} className={classes.addInput} />
      </div>
      <div>
        <button disabled={inputText ? false : true} onClick={onCLickHandler} className={classes.addBtn}>
          Add
        </button>
      </div>
    </div>
  );
};

export default TextAdder;
