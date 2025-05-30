import { useState } from 'react'
import { Link } from 'react-router-dom'
import fb from '../assets/icon/fb.svg'
import insta from '../assets/icon/insta.svg'
import X from '../assets/icon/X.svg'
import email from '../assets/icon/email.svg'
import copyright from '../assets/icon/copyright.svg'

function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  };

  const navBarData = [
    {
      name: '',
      color: '#96ADD6',
      links: [
        {
          name: 'ЭЕШ Материал',
          link: '/EYSH'
        },
        {
          name: 'SAT Шалгалтын талаар',
          link: '/SATstatistic'
        },
        {
          name: 'Математик томьёо',
          link: '/eish'
        },
        {
          name: 'Тодорхойлолтууд',
          link: '/eish'
        },
        {
          name: 'Сэдвийн бүрэлдэхүүн',
          link: '/eish'
        },
          
      ]
    },
    {
      name: '',
      color: '#F8B8AF',
      links: [
        {
          name: 'Бидний тухай',
          link: '/eish'
        },
        {
          name: 'Боловсролын талаар',
          link: '/eish'
        },
        {
          name: 'Олимпиадууд',
          link: '/eish'
        },
      ]
    },
    {
      name: '',
      color: '#01408D',
      links: [
        {
          name: 'Тодорхойлолтууд',
          link: '/eish'
        },
        {
          name: 'Томьёо',
          link: '/eish'
        },
        {
          name: 'Сэдвийн бүрэлдэхүүн',
          link: '/eish'
        },
      ]
    },
    {
      name: '',
      color: '#E75234',
      links: [
        {
          name: 'Холбоо барих',
          link: '/eish'
        },
        {
          name: 'Спонсорлох',
          link: '/eish'
        },
        {
          name: 'Түгээмэл асуултууд',
          link: '/eish'
        },
        {
          name: 'Редакцийн ёс зүй',
          link: '/eish'
        },
        {
          name: 'Нууцлалын бодлого',
              link: '/eish'
        },
      ]
    }
  ]

  return (
    <div>
        <div className="w-full bg-[#F5DAC6] pt-20 p-4 justify-center flex flex-col">
            <div className="w-full justify-center flex flex-col sm:flex-row gap-10"> 
                {
                    navBarData.map((item) => (
                        <div key={item.name} className='sm:p-2 p-2 pl-8  sm:w-1/5 w-full border-t-4' style={{ borderColor: item.color }}>
                            <h3 className='font-extrabold text-lg my-2'>{item.name}</h3>
                            <ul className='ml-4'>
                                {item.links.map((link) => (
                                    <li key={link.name}>
                                        <Link to={link.link} onClick={scrollToTop}>{link.name}</Link>
                                    </li>
                                ))}
                                </ul>
                            </div>
                    ))
                }
            </div>
            <div className='flex flex-row sm:pl-24 pl-32 pt-5'>
                <img src={fb} alt="fb" className='scale-[70%]' />
                <img src={insta} alt="insta" className='scale-75' />
                <img src={X} alt="X" className='scale-[60%]' />
                <img src={email} alt="email" className='scale-75' />
            </div>
        </div>
        <div className=' sm:flex-row hidden sm:flex flex-col items-center gap-2 sm:ml-20 mt-4 mb-4'>
        <img src={copyright} alt="copyright" className='scale-75' />
        2025 Матийн цагаан солиотнууд ХХК
        <div className='rounded-full w-2 h-2 bg-black'></div>
        Бүх эрх хуулиар хамгаалагдсан
        </div>
    </div>
  )
}

export default Footer
