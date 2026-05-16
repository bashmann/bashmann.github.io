Copy To All Points
Useful for duplicating a single asset to pre-setup locations, I've used this for things such as replacing none instanced meshes and kit-bashing. To use simply select every object you wish to copy to and then finally the object you wish to copy to those points and run this script.

//Copy to positions

proc string GetLastSelected(){
    string $selection[] = `ls -selection`;
    return $selection[size($selection)-1];
}

proc string[] GetAllButLastSelected(){
    string $selection[] = `ls -selection`;
    stringArrayRemoveAtIndex(size($selection)-1, $selection);
    return $selection;
}

proc CopyTo(string $target, string $source){
    string $copy[] = `duplicate $source`;
    select $source;
    vector $targetLoc = `xform -q -t -ws $target`;
    print ($targetLoc + "\n");
    move -a -ws ($targetLoc.x) ($targetLoc.y) ($targetLoc.z) $copy[0];
}

proc CopyToAll(string $targets[], string $source){
    for($target in $targets){
        CopyTo($target, $source);
    }
}

proc SafeCopyToAll() {
    string $selection[] = `ls -selection`;
    if (size($selection) > 0 ){
        CopyToAll(GetAllButLastSelected(),GetLastSelected());
    }
}

SafeCopyToAll();
