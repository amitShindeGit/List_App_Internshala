import React, { useEffect, useState } from 'react'
import Item from './Item'
import db from "../FIrebase/Firebase";
import {
  collection,
  onSnapshot,
} from "firebase/firestore";

const ItemList = () => {
  const colRef = collection(db, "List");
  const [testData, setTestData] = useState([]);
  const [listItemLength, setListItemLength] = useState(0);

  useEffect(() => {
    //real time update
    //This code is responsible for realtime updates on screen.
    const unSub = onSnapshot(colRef, (snapshot) => {
      let listArr = [];
      snapshot.forEach((e) => {
        listArr.push({ ...e.data(), id: e.id, Text: e.data().Text });
      });

      listArr.sort((a,b) => (a.index > b.index) ? 1 : -1)
      setListItemLength(listArr.length);
      setTestData(listArr);
    });
    return () => unSub();
  }, [])

  return (
    <div>
        {testData.map((item, i) => {
          {return !(i+1 === listItemLength) ?  <Item key={item.index} id={item.id} index={item.index} text={item.Text} isPinned={item.isPinned} lastItem={false} firstItem={i}  /> : 
            <Item key={item.id} id={item.id} index={item.index} text={item.Text} isPinned={item.isPinned} lastItem={true} firstItem={i}  /> //have to pass firstItem as well
          }
        })}
    </div>
  )
}

export default ItemList