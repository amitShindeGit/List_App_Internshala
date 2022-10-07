import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import React from "react";
import db from "../FIrebase/Firebase";
import classes from "../Styles/Item.module.css";

const Item = ({ id, index, text, lastItem, firstItem, isPinned }) => {
  const dbRef = collection(db, "List");

  const onUpClickHandler = async (currId, currIndex) => {
    let updateItemId = "";
    let updateItemIndex;

    //Below is a complex query, it requires indexing done to firebase DB
    const q = query(
      dbRef,
      where("isPinned", "==", false),
      where("index", "<", currIndex),
      orderBy("index", "desc"),
      limit(1)
    ); //< and desc for immediate upper element,

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (it) => {
      updateItemId = it.id;
      updateItemIndex = it.data().index;
    });

    //BATCH operation for item to move up
      try { //error handling if above item is pinned
      const batch = writeBatch(db);
      const currItemRef = doc(db, "List", currId);
      batch.update(currItemRef, { index: updateItemIndex });

      const updateItem = doc(db, "List", updateItemId); 
      batch.update(updateItem, { index: currIndex });

      await batch.commit();
      } catch (error) {
          alert("Can't go up!")
      }
  };

  const onDownClickHandler = async (currId, currIndex) => {
    let updateItemId = "";
    let updateItemIndex;
    let canGoDown = true;

    const q = query(
      dbRef,
      where("index", ">", currIndex),
      orderBy("index"),
      limit(1)
    ); // order by increment for immediate down item

    const currDocRef = doc(db, "List", currId);
    const currDocSnap = await getDoc(currDocRef);
    if(currDocSnap.data().isPinned === true){
      canGoDown = false;  
    }

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (it) => {
      updateItemId = it.id;
      updateItemIndex = it.data().index;
    });

    //BATCH operation for item to go down in List
    if(canGoDown){
    const batch = writeBatch(db);
    const currItemRef = doc(db, "List", currId);
    batch.update(currItemRef, { index: updateItemIndex });

    const updateItem = doc(db, "List", updateItemId); //check for existence updateItemId
    batch.update(updateItem, { index: currIndex });

    await batch.commit();
    }
  };

  // Delete item handler
  const onDeletHandler = async (currId) => {
    await deleteDoc(doc(db, "List", currId));
  };

  //Pin item handler
  const pinHandler = async (id) => {
    let pinnedElementExists = false;

    const q2 = query(dbRef, orderBy("index"), limit(1));
    const currPinned = query(dbRef, where("isPinned", "==", true), limit(1));

    const querySnapshotPin = await getDocs(currPinned);
    querySnapshotPin.forEach(async (it) => {
      if (it.data().isPinned === true) {
        pinnedElementExists = true;
      }
    });

    let currFirstIndex = 0;
    const docRef = doc(db, "List", id);
    const currData = await getDoc(docRef);

    //Conditions check before Pinning an item
    if (!pinnedElementExists && currData.data().isPinned === false) {
      const querySnapshot = await getDocs(q2);
      querySnapshot.forEach(async (it) => {
        currFirstIndex = it.data().index;
      });

      //Batch operation for pinning element
      const batch = writeBatch(db);
      const updateItem = doc(db, "List", id);
      batch.update(updateItem, { index: currFirstIndex - 1, isPinned: true });
      await batch.commit();
    } else if (pinnedElementExists && currData.data().isPinned === true) {
      const batch = writeBatch(db);

      const updateItem = doc(db, "List", id);

      batch.update(updateItem, { isPinned: false });

      await batch.commit();
    } else {
      alert("Only one element can be pinned at a time.");
    }
  };

  return (
    <div className={classes.itemMainDIv}>
      <div className={classes.leftDiv}>
        <p>{text}</p>
      </div>

      <div className={classes.rightDiv}>
        <div className={classes.rightFirstDiv}>
          {/* do styling instead */}
          <button
            disabled={firstItem === 0 ? true : false}
            className={classes.arrowBtn}
            onClick={() => onUpClickHandler(id, index)}
          >
            <i
              className="fas fa-solid fa-arrow-up"
              style={{
                display: "inline",
                color: `${firstItem === 0 ? "grey" : "#4711DE"}`,
                cursor: `${firstItem === 0 ? "not-allowed" : "pointer"}`,
              }}
            ></i>
          </button>

          <button
            disabled={lastItem ? true : false}
            className={classes.arrowBtn}
            onClick={() => onDownClickHandler(id, index)}
          >
            <i
              className="fas fa-solid fa-arrow-down"
              style={{
                display: "inline",
                color: `${lastItem ? "grey" : "#4711DE"}`,
                cursor: `${lastItem ? "not-allowed" : "pointer"}`,
              }}
            ></i>
          </button>
        </div>

        <div className={classes.btnClass}>
          <p onClick={() => onDeletHandler(id)} className={classes.deleteIcn}>
            x
          </p>
          <i
            className="fa fa-thin fa-thumbtack "
            style={{
              color: `${isPinned ? "#4711DE" : "grey"}`,
              marginTop: ".2rem",
              cursor: "pointer",
            }}
            onClick={() => pinHandler(id)}
          ></i>
        </div>
      </div>
    </div>
  );
};

export default Item;
