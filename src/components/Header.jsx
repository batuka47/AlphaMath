import { useState } from 'react'
import { Link } from 'react-router-dom'
import logoText from '../assets/logoText.svg'
import pointUp from '../assets/icon/pointUp.svg'
import pointDown from '../assets/icon/pointDown.svg'
import profile from '../assets/icon/profile.svg'
import bookmark from '../assets/icon/bookmark.svg'

function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const navBarData = [
    {
      name: 'ЭЕШ',
      color: '#96ADD6',
      links: [
        {
          name: 'Материал',
          link: '/EYSH'
        },
        {
          name: 'Заавар',
          link: '/EYSHadvice'
        },
        {
          name: 'Тест өгөх',
          link: '/EYSH'
        },
      ]
    },
    {
      name: 'SAT',
      color: '#F8B8AF',
      links: [
        {
          name: 'Шалгалтын талаар',
          link: '/SATstatistic'
        },
        {
          name: 'Заавар',
          link: '/SATstrategy'
        },
        {
          name: 'Тест өгөх',
          link: '/EYSH'
        },
        {
          name: 'Материал',
          link: '/EYSH'
        },
      ]
    },
    {
      name: 'Онолын Математик',
      color: '#01408D',
      links: [
        {
          name: 'Тодорхойлолтууд',
          link: '/EYSH'
        },
        {
          name: 'Томьёо',
          link: '/EYSH'
        },
        {
          name: 'Сэдвийн бүрэлдэхүүн',
          link: '/EYSH'
        },
      ]
    },
    {
      name: '',
      color: '#FFFFFF',
      links: [
        {
          name: 'Бидний тухай',
          link: '/EYSH'
        },
        {
          name: 'Сурталчилгаа байршуулах',
          link: '/EYSH'
        },
        {
          name: 'Хамтарч ажиллах',
          link: '/EYSH'
        },
        {
          name: 'Түгээмэл асуултууд',
          link: '/EYSH'
        },
      ]
    }
  ]

  return (
    <div>
        {isOpen && (
            <div className="fixed inset-0 bg-black opacity-50 z-10" />
        )}
        <div className='flex relative items-center justify-between w-full h-16 sm:px-10 px-4 flex-row bg-white shadow-md z-10'>
          <div className='flex items-center justify-center flex-row gap-4 z-10'>
            <Link to="/">
              <img src={logoText} alt="logo" className='h-10' />
            </Link>
              <div className='relative cursor-pointer'>
                  <div onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen}>
                      {isOpen ? (
                          <img 
                              src={pointUp} 
                              alt="up" 
                              className="w-6 h-6 pt-0.5" 
                          />
                      ) : (
                          <img 
                              src={pointDown}
                              alt="down" 
                              className="w-6 h-6 pt-0.5" 
                              />
                            )}
                  </div>
              </div>
          </div>
          {/* <div className='flex items-center justify-center flex-row gap-10 z-10'>
              <img src={profile} alt="profile" className='w-8 h-8' />
              <img src={bookmark} alt="bookmark" className='w-8 h-8' />
          </div> */}
        </div>
        {isOpen && (
                    <div className={`absolute w-full bg-[#F5DAC6] top-16 left-0 shadow-lg rounded-b-lg p-4 justify-center flex sm:flex-row flex-col gap-4 z-20 transition-opacity duration-300 ease-in-out transform ${isOpen ? 'scale-y-100 translate-y-0 opacity-100' : 'scale-y-95 -translate-y-4 opacity-0'}`}> 
                        {
                          navBarData.map((item) => (
                            <div key={item.name} className='p-2 sm:w-1/5 w-full border-t-4' style={{ borderColor: item.color }}>
                              <h3 className='font-extrabold text-lg my-2'>{item.name}</h3>
                              <ul className='sm:ml-4 '>
                                {item.links.map((link) => (
                                  <li key={link.name}>
                                    <Link to={link.link}>{link.name}</Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))
                        }
                    </div>
                )}
    </div>
  )
}

export default Header
