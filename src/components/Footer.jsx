import { Link } from 'react-router-dom'
import fb        from '../assets/icon/fb.svg'
import insta     from '../assets/icon/insta.svg'
import X         from '../assets/icon/X.svg'
import email     from '../assets/icon/email.svg'

const columns = [
    {
        id: 'materials',
        name: 'Материал',
        color: '#96ADD6',
        links: [
            { name: 'ЭЕШ Тест',            link: '/EYSH'   },
            { name: 'SAT Математик',        link: '/SAT'    },
            { name: 'Онолын Математик',     link: '/Theory' },
        ]
    },
    {
        id: 'about',
        name: 'Бидний тухай',
        color: '#F8B8AF',
        links: [
            { name: 'Бидний тухай',            link: '/About'  },
            { name: 'Сурталчилгаа',            link: '/ads'    },
            { name: 'Хамтарч ажиллах',         link: '/collab' },
        ]
    },
    {
        id: 'support',
        name: 'Дэмжлэг',
        color: '#E75234',
        links: [
            { name: 'Холбоо барих',       link: '/contact'   },
            { name: 'Түгээмэл асуултууд', link: '/FAQ'       },
            { name: 'Редакцийн ёс зүй',   link: '/editorial' },
            { name: 'Нууцлалын бодлого',  link: '/privacy'   },
        ]
    }
]

const socials = [
    { src: fb,    alt: 'Facebook',  href: '#' },
    { src: insta, alt: 'Instagram', href: 'https://www.instagram.com/_batuka_7/' },
    { src: X,     alt: 'X',        href: '#' },
    { src: email, alt: 'Email',    href: 'mailto:alphamath.admin@gmail.com' },
]

function Footer() {
    return (
        <footer className="bg-[#F5DAC6]/60 border-t border-[#F5DAC6]">
            <div className="max-w-6xl mx-auto px-6 sm:px-12 pt-14 pb-8">

                {/* Top — columns */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 mb-12">
                    {columns.map(col => (
                        <div key={col.id}>
                            <div className="w-8 h-1 rounded-full mb-3" style={{ backgroundColor: col.color }} />
                            <h3 className="font-extrabold text-sm text-gray-800 mb-3">{col.name}</h3>
                            <ul className="flex flex-col gap-2">
                                {col.links.map(l => (
                                    <li key={l.name}>
                                        <Link
                                            to={l.link}
                                            className="text-sm text-gray-500 hover:text-[#E75234] transition-colors"
                                        >{l.name}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom — socials + copyright */}
                <div className="border-t border-[#F5DAC6] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-gray-400">
                        © 2026 Матийн цагаан солиотнууд ХХК · Бүх эрх хамгаалагдсан
                    </p>
                    <div className="flex items-center gap-3">
                        {socials.map(s => (
                            <a
                                key={s.alt}
                                href={s.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md transition-shadow"
                                title={s.alt}
                            >
                                <img src={s.src} alt={s.alt} className="w-4 h-4 object-contain" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
