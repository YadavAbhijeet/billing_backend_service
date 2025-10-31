(async ()=>{
  try{
    const res = await fetch('http://localhost:3000/api/customers');
    const data = await res.json();
    console.log(JSON.stringify(data,null,2));
  }catch(e){console.error(e)}
})();
