import { NextResponse , NextRequest} from "next/server";
import connect from "@/lib/data";
import Permission from "@/models/permission";

export async function GET(req:NextRequest) {
   try{
    const id  = req.headers.get("id");
    if(!id){
        return NextResponse.json({error:"id is required"}, { status: 400 });
    }
    await connect();
    const permission = await Permission.findById(id);
    return NextResponse.json(permission);
}catch(error){
    return NextResponse.json({error:"error fetch permission"+ error,  }, { status: 500 });
}
}

