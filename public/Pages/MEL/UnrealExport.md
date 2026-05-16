Unreal Engine Export
This tool removes the requirement of moving the asset to the origin in maya. Run this script, select the folder you wish to export the meshes to. Select the assets you wish to export and hit export. This script will then export every asset with their outliner name to the selected folder. This will overwrite existing assets with the same name in that folder (assuming they are checked out of source control). It is incredibly useful for working with a Maya -> UE4 workflow and allows for a much quicker iterative process. 

(Tested with static meshes only, will not work with socket nulls).

 

//export meshes for ue, uses outliner names, select export folder, 

proc ExportAssets(string $path){
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
        
        //store trans and rot
        float $cT[] = `xform -q -ws -t $obj`;
        float $cR[] = `xform -q -ws -ro $obj`;
        
        //0 them out
        setAttr ($obj+".translateX")  0;
        setAttr ($obj+".translateY")  0;  
        setAttr ($obj+".translateZ")  0;
        setAttr ($obj+".rotateX")  0;
        setAttr ($obj+".rotateY")  0;
        setAttr ($obj+".rotateZ")  0;
               
        //move object so pivot is at 0 0 0
        move -rpr 0 0 0 $obj;
         
         //store difference between 0 0 0 and old position
        float $cTo[] = `xform -q -ws -t $obj`;
        
        //freeze again
        channelBoxCommand -freezeTranslate;
        channelBoxCommand -freezeRotate;
        
        //export
        file -force -options "fbx" -type "FBX export" -pr -es ($path+"/"+$exportName+".fbx");

        
        //move back to original position
        setAttr ($obj+".translateX")  (-1* $cTo[0]);
        setAttr ($obj+".translateY")  (-1* $cTo[1]);  
        setAttr ($obj+".translateZ")  (-1* $cTo[2]);
        
        //freeze one more time
        channelBoxCommand -freezeTranslate;
        
        //apply original transforms
        setAttr ($obj+".translateX")  $cT[0];
        setAttr ($obj+".translateY")  $cT[1];  
        setAttr ($obj+".translateZ")  $cT[2];
        setAttr ($obj+".rotateX")  $cR[0];
        setAttr ($obj+".rotateY")  $cR[1];
        setAttr ($obj+".rotateZ")  $cR[2];
        
        if($originalParent != "|") {
            $inProgressName = `parent -absolute $obj $originalParent`;
            $obj = $inProgressName[0];
            rename($obj, $exportName);
        }
    }
    return;
}

proc string GetTxtFieldContent(string $textField){
    return `textField -query -text $textField`;
    }

proc SelectPath(string $textField){
    // create the file popup and set the textfield to the return result
    textField -e -text `fileDialog2 -okc "Select" -cap "Select Path" -fm 3` $textField;
    return;
} 

//destroy window if already exists
if (`window -exists ExportAllSelectedCustom`) {deleteUI ExportAllSelectedCustom;}
//create the popup
window -t "Export All Selected" -wh 350 200 -rtf 1 ExportAllSelectedCustom;
    //format window
    rowColumnLayout -nc 2 -cat 1 "right" 0
        -cw 1 100 -cw 2 250 -cs 2 10 -rs 1 10 -ro 1 "top" 20 -cal 1 "center";
                    text -al "center" -l "Path:";
                    string $txtField = `textField`; 
                    textField -e -text "select a Path" $txtField;
                    button -label "Select Path" -command "SelectPath($txtField)";
                    button -label "Export" -command "ExportAssets(`textField -query -text $txtField`)";
showWindow ExportAllSelectedCustom;

