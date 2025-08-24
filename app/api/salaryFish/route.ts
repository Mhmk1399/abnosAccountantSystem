import { NextRequest,NextResponse } from "next/server";
import connect from "@/lib/data";
import { calculateStaffSalary } from "@/services/calulateTheWorkerWorkes";


export const GET = async (request:NextRequest)=>{
await connect()
    try{
        const staffId=request.headers.get('staffId')
        const month= request.headers.get('month')
        const year=request.headers.get('year')
        if(!staffId||!month||!year){
            return NextResponse.json({error:"missing requirements "})
        }
       const res= await calculateStaffSalary(staffId, parseInt(month), parseInt(year))
        
        return NextResponse.json({res},{status:200})
    }catch(error){
    return NextResponse.json({ error: "Error: " + error }, { status: 500 });
    }

}