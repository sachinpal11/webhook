import axios from 'axios';
import React, { useRef, useState } from 'react';

function App() {
  const InputRef = useRef();
  const [text, setText] = useState("hello");

  const CallHook = async () => {
    try {
      const inputValue = InputRef.current.value;

      const res = await axios.post("https://sainmedia12.app.n8n.cloud/webhook/webhook-testing", {
        data: inputValue
      });

      console.log(res.data);
      setText(JSON.stringify(res.data)); // optional, if you want to show the webhook response in <textarea>
    } catch (error) {
      console.error("Error sending data to webhook:", error);
      setText("Error sending data.");
    }
  };

  return (
    <div className='text-2xl p-4'>
      <h1 className='mb-4'>hello</h1>
      <input ref={InputRef} type="text" className='border-2 p-2 mb-4' />
      <button onClick={CallHook} className='bg-blue-500 text-white px-4 py-2 rounded ml-2'>Submit</button>
      <textarea
        className='border-2 block mt-4 w-full h-32 p-2'
        value={text}
        readOnly
      />
    </div>
  );
}

export default App;
