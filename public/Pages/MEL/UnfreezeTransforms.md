Unfreeze Transforms
Removes the translation changes applied to the selected objects, simply select the objects you wish to restore the relative transforms on and run this script:

//unfreeze translations

proc UnfreezeTranslations(){
    string $selection[] = `ls -sl`;
    for($obj in $selection){
        select -r $obj;
        
        //export name and obj location
        string $objArray[] = stringToStringArray($obj, "|");
        string $parentArray[] = {"|"};
        appendStringArray($parentArray,$objArray,size($objArray) -1);
        string $originalParent = stringArrayToString($parentArray,"|");
        string $exportName = $objArray[size($objArray) -1];
        
        //set parent to world
        string $inProgressName[];
        if($originalParent != "|") {
            $inProgressName = `parent -world $obj`;
            $obj = $inProgressName[0];
            print("was in group");
        }
        
        //store trans
        float $cT[] = `xform -q -ws -t $obj`;
        
        //0 them out
        setAttr ($obj+".translateX")  0;
        setAttr ($obj+".translateY")  0;  
        setAttr ($obj+".translateZ")  0;
               
        //move object so pivot is at 0 0 0
        move -rpr 0 0 0 $obj;
         
         //store difference between 0 0 0 and old position
        float $cTo[] = `xform -q -ws -t $obj`;

        channelBoxCommand -freezeTranslate;
        
        //move back to original position
        setAttr ($obj+".translateX")  (-1* $cTo[0] + $cT[0]);
        setAttr ($obj+".translateY")  (-1* $cTo[1] + $cT[1]);  
        setAttr ($obj+".translateZ")  (-1* $cTo[2] + $cT[2]);
        
        if($originalParent != "|") {
            $inProgressName = `parent -absolute $obj $originalParent`;
            $obj = $inProgressName[0];
            rename($obj, $exportName);
        }
    }
}

UnfreezeTranslations();