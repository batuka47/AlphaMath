import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

function MaterialChoose({ year, availableVariants }) {
    const variants = ['A', 'B', 'C', 'D']

    return (
        <div className="flex w-full h-24 flex-row rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-white">
            <div className="w-1 bg-gradient-to-b from-[#295A96] to-[#E29578] flex-shrink-0" />
            <div className="flex-1 px-5 flex flex-col justify-center gap-2">
                <h2 className="font-bold text-base text-gray-800">{year} он</h2>
                <div className="flex flex-row gap-1.5">
                    {variants.map(v => {
                        const available = availableVariants.has(v)
                        if (available) {
                            return (
                                <Link
                                    key={v}
                                    to={`/EYSH/${year}-${v}`}
                                    className="w-8 h-8 rounded-lg bg-[#F5DAC6] text-[#E75234] font-extrabold text-sm flex items-center justify-center hover:bg-[#E75234] hover:text-white transition-colors"
                                >
                                    {v}
                                </Link>
                            )
                        }
                        return (
                            <span
                                key={v}
                                className="w-8 h-8 rounded-lg bg-gray-100 text-gray-300 font-extrabold text-sm flex items-center justify-center cursor-not-allowed"
                                title="Мэдээлэл байхгүй"
                            >
                                {v}
                            </span>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

MaterialChoose.propTypes = {
    year:              PropTypes.number.isRequired,
    availableVariants: PropTypes.instanceOf(Set),
}

MaterialChoose.defaultProps = {
    availableVariants: new Set(['A', 'B', 'C', 'D']),
}

export default MaterialChoose
