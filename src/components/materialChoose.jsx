import { useState } from 'react'
import { Link } from 'react-router-dom'
import A from '../assets/icon/A.svg'
import B from '../assets/icon/B.svg'
import C from '../assets/icon/C.svg'
import D from '../assets/icon/D.svg'
function MatirialChoose(props){
    return (
       <div className="flex w-full h-28 flex-row rounded-xl p-0.5 bg-linear-to-br from-[#295A96] to-[#E29578]">
            <div className="bg-white rounded-[10px] w-full px-6 gap-2 flex flex-col justify-center ">
                <h1 className="font-bold text-[20px]">Математик {props.year} он</h1>
                <div className="flex flex-row">
                    <Link to={`/EYSH/${props.year}-A`}><img src={A} alt="A" className='scale-[85%]' /></Link>
                    <Link to={`/EYSH/${props.year}-B`}><img src={B} alt="B" className='scale-[85%]'/></Link>
                    <Link to={`/EYSH/${props.year}-C`}><img src={C} alt="C" className='scale-[85%]'/></Link>
                    <Link to={`/EYSH/${props.year}-D`}><img src={D} alt="D" className='scale-[85%]'/></Link>
                </div>
            </div>
       </div>
    )
}
export default MatirialChoose