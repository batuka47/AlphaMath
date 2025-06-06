import { useState, useEffect, useRef } from 'react'
import RadioButton from './RadioBtn'
import parse from 'html-react-parser';

function Test(props) {
    const [selectedValue, setSelectedValue] = useState(props.selectedAnswer || '');
    const [isImageWide, setIsImageWide] = useState(false);
    const imageRef = useRef(null);

    useEffect(() => {
        setSelectedValue(props.selectedAnswer || '');
    }, [props.selectedAnswer]);

    useEffect(() => {
        const checkImageWidth = () => {
            if (imageRef.current) {
                const imageWidth = imageRef.current.offsetWidth;
                const screenWidth = window.innerWidth;
                setIsImageWide(imageWidth > screenWidth / 3);
            }
        };

        checkImageWidth();
        window.addEventListener('resize', checkImageWidth);
        return () => window.removeEventListener('resize', checkImageWidth);
    }, [props.img]);

    const handleChange = (event) => {
        const newValue = event.target.value;
        setSelectedValue(newValue);
        props.onAnswerSelect(props.id, newValue);
    };  

    // Function to add keys to parsed elements
    const parseWithKeys = (html, prefix = '') => {
        if (!html) return null;
        let counter = 0; // Add a counter for unique keys
        
        return parse(html, {
            replace: (domNode) => {
                if (domNode.type === 'tag' && !domNode.attribs.key) {
                    const nodeType = domNode.name || 'unknown';
                    const content = domNode.children?.[0]?.data || '';
                    // Add counter to ensure uniqueness
                    domNode.attribs.key = `${props.id}-${prefix}-${nodeType}-${counter++}-${content.substring(0, 10)}`;
                }
                return domNode;
            }
        });
    };

    return (
        <div className="w-full relative">
            <div className="font-semibold sm:text-xl sm:mt-8 mt-4 flex gap-1 sm:w-2/3 w-full">
                <span>{props.id}.</span>
                <div className="flex sm:px-4 px-2 items-center">
                    {parseWithKeys(props.text, 'text')}
                </div>
            </div>
            <img 
                ref={imageRef}
                src={props.img} 
                className={`${isImageWide ? 'sm:w-full scale-[60%] sm:-ml-56 ml+6 ' : 'sm:absolute sm:right-2 sm:-top-4 scale-75'}`} 
                alt="" 
            />
            
            <div className="sm:p-4 sm:w-2/3 w-full sm:scale-100 scale-75">
                <RadioButton
                    key={`${props.id}-A`}
                    label={parseWithKeys(props.labelA, 'A')}
                    value="A"
                    checked={selectedValue === "A"}
                    onChange={handleChange}
                />
                <RadioButton
                    key={`${props.id}-B`}
                    label={parseWithKeys(props.labelB, 'B')}
                    value="B"
                    checked={selectedValue === "B"}
                    onChange={handleChange}
                />
                <RadioButton
                    key={`${props.id}-C`}
                    label={parseWithKeys(props.labelC, 'C')}
                    value="C"
                    checked={selectedValue === "C"}
                    onChange={handleChange}
                />
                <RadioButton
                    key={`${props.id}-D`}
                    label={parseWithKeys(props.labelD, 'D')}
                    value="D"
                    checked={selectedValue === "D"}
                    onChange={handleChange}
                />
                <RadioButton
                    key={`${props.id}-E`}
                    label={parseWithKeys(props.labelE, 'E')}
                    value="E"
                    checked={selectedValue === "E"}
                    onChange={handleChange}
                />
            </div>
        </div>
    )
}

export default Test;