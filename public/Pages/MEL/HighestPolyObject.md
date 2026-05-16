Highest Poly Object
I found this script useful for retopo of scan data that has multiple parts, it allows me to quickly find meshes that are higher poly than they need to be. Select all the meshes you wish to check and then run the script.

//Select Highest Poly Mesh

string $selection[] = `ls -selection`;
int $highestPolyCount = 0;
string $highestPolyCountObj;
for ($obj in $selection) {
    int $eval[] = `polyEvaluate -f $obj`;
    int $curPolyCount = $eval[0];
    if ($curPolyCount > $highestPolyCount)
    {
        $highestPolyCountObj = $obj;
        $highestPolyCount = $curPolyCount;
        print $highestPolyCountObj;
    }
}
select -r $highestPolyCountObj;