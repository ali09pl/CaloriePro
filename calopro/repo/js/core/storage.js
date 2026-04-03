// =========================================================
// MODULE: STORAGE
// =========================================================
const LS={
  get:(k,d)=>{try{const v=localStorage.getItem(k);return v!==null?JSON.parse(v):d}catch{return d}},
  set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}},
};

