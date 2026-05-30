import PropTypes from 'prop-types'

const RadioButton = ({ label, value, checked, onChange }) => {
    return (
        <label className={`
            flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer
            text-sm font-semibold transition-all duration-150 select-none w-full sm:w-auto
            ${checked
                ? 'bg-[#FFF0ED] border-2 border-[#E75234] text-[#E75234]'
                : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            }
        `}>
            <input
                type="radio"
                value={value}
                checked={checked}
                onChange={onChange}
                className="sr-only"
            />
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                checked ? 'border-[#E75234]' : 'border-gray-300'
            }`}>
                {checked && <div className="w-2 h-2 rounded-full bg-[#E75234]" />}
            </div>
            <span className="leading-relaxed">{value}. {label}</span>
        </label>
    )
}

RadioButton.propTypes = {
    label:    PropTypes.node,
    value:    PropTypes.string.isRequired,
    checked:  PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
}

RadioButton.defaultProps = { label: '' }

export default RadioButton
