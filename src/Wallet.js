import React, { useState,useEffect } from "react";
import "./Wallet.css";
import { Pie, Tooltip } from 'recharts';
// import { RechartsDevtools } from '@recharts/devtools';
import PieChart from "../src/PieChart";
import Modal from "../src/Modal";
import { useSnackbar } from 'notistack';
import foodIcon from "../src/Assets/Group 59.png";
import travelIcon from "../src/Assets/Group 61.png";
import entertainmentIcon from "../src/Assets/Group 60.png";



function Wallet() {
  const [balance, setBalance] = useState(5000);
  const [expense, setExpense] = useState([]);
  const [isMounted, setIsMounted] = useState(false);


  const [showModal, setShowModal] = useState(false);
  const [IncomeModal, setIncomeModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "",
    date:"",
    amount:""
  });
    const [categorySpends, setCategorySpends] = useState({
    food: 0,
    entertainment: 0,
    travel: 0,
  });
  const [categoryCount, setCategoryCount] = useState({
    food: 0,
    entertainment: 0,
    travel: 0,
  });
    const [errors, setErrors] = useState({});
    const [editId, setEditId] = useState(null)
    const { enqueueSnackbar } = useSnackbar();



      const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateIncome = ()=>{
    let tempErrors = {};
     if (!formData.amount) {
    tempErrors.amount = "Amount is required";
  } else if (Number(formData.amount) <= 0) {
    tempErrors.amount = "Amount must be greater than 0";
  }
  setErrors(tempErrors);
  return Object.keys(tempErrors).length === 0;

  }

   const validate = () => {
    let tempErrors = {};

    if (!formData.title.trim()) {
      tempErrors.title = "Title is required";
    } else if (formData.title.length < 3) {
      tempErrors.title = "Title must be at least 3 characters";
    }

    if (!formData.price) {
      tempErrors.price = "Price is required";
    } else if (formData.price <= 0) {
      tempErrors.price = "Price must be greater than 0";
    }

    if (!formData.category) {
      tempErrors.category = "Please select a category";
    }

      if (!formData.date) {
      tempErrors.date = "Please select a date";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  
 const handleIncomeSubmit = (e) => {
  e.preventDefault();

  if (validateIncome()) {
    setBalance(prev => prev + Number(formData.amount));

    setFormData({ amount: "" });
    setErrors({});
    setIncomeModal(false);
  }
};


  const handleCancel = () => {
    setErrors({});
    setShowModal();
    setIncomeModal();
  };

const handleAddExpense = (e) => {
  e.preventDefault();

  if (!validate()) return;

  const expenseAmount = Number(formData.price);

  if (expenseAmount > balance) {
    enqueueSnackbar("Price should not exceed the wallet balance", { variant: "warning" });
    return;
  }

  const newExpense = {
    id: Date.now(),
    title: formData.title,
    amount: expenseAmount,
    category: formData.category,
    date: formData.date,
  };

  setExpense(prev => [...prev, newExpense]);
  setBalance(prev => prev - expenseAmount); // ✅ deduct dynamically

  setFormData({
    title: "",
    price: "",
    category: "",
    date: "",
    amount: "",
  });

  setErrors({});
  setShowModal(false);
};




  
    let foodSpends = 0,
      entertainmentSpends = 0,
      travelSpends = 0;
    let foodCount = 0,
      entertainmentCount = 0,
      travelCount = 0;

     const data = [
  {
    name: "Food",
    value: expense
      .filter(e => e.category === "food")
      .reduce((sum, e) => sum + e.amount, 0)
  },
  {
    name: "Travel",
    value: expense
      .filter(e => e.category === "travel")
      .reduce((sum, e) => sum + e.amount, 0)
  },
   {
    name: "Entertainment",
    value: expense
      .filter(e => e.category === "entertainment")
      .reduce((sum, e) => sum + e.amount, 0)
  }
];

const categoryIcons = {
  food: foodIcon,
  travel: travelIcon,
  entertainment: entertainmentIcon,
};

const categoryTotals = expense.reduce((acc, curr) => {
  acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
  return acc;
}, {});

const barData = Object.keys(categoryTotals).map((key) => ({
  name: key,
  value: categoryTotals[key]
}));

const totalExpense = expense.reduce(
  (sum, item) => sum + item.amount,
  0
);
    console.log(expense)

    const handleDelete = (id)=>{
       const itemToDelete = expense.find(item => item.id === id);
  if (!itemToDelete) return;

  // Refund the amount back to balance
  setBalance(prev => prev + Number(itemToDelete.amount));

  // Remove the item from expense list
  const updatedExpenses = expense.filter(item => item.id !== id);
  setExpense(updatedExpenses);
      
    }

    const handleUpdateExpense = (e) => {
  e.preventDefault();

  if (!validate()) return;

  const newAmount = Number(formData.price);

  const oldItem = expense.find(item => item.id === editId);
  if (!oldItem) return;

  const oldAmount = Number(oldItem.amount);

  const diff = oldAmount - newAmount;

  // If new amount is higher, check balance
  if (diff < 0 && Math.abs(diff) > balance) {
    enqueueSnackbar("Price should not exceed the wallet balance", { variant: "warning" });
    return;
  }

  // Update balance
  setBalance(prev => prev + diff);

  const updated = expense.map(item =>
    item.id === editId
      ? {
          ...item,
          title: formData.title,
          amount: newAmount,
          category: formData.category,
          date: formData.date,
        }
      : item
  );

  setExpense(updated);

  // Reset form + close modal
  setEditId(null);
  setShowModal(false);

  setFormData({
    title: "",
    price: "",
    category: "",
    date: "",
    amount: "",
  });

  setErrors({});
};

   const handleEdit = (item) => {
       setFormData({
    title: item.title,
    price: item.amount,   // important: use amount
    category: item.category,
    date: item.date,
    amount: ""
  });
  setEditId(item.id);
  setShowModal(true); // open expense modal
      }
    const maxBarValue = Math.max(...barData.map(item => item.value), 1);


    useEffect(() => {
    //Check localStorage
    const localBalance = localStorage.getItem("balance");

    if (localBalance && !isNaN(localBalance)) {
      setBalance(Number(localBalance));
    } else {
      setBalance(5000);
      localStorage.setItem("balance", "5000");
    }

    const items = JSON.parse(localStorage.getItem("expenses"));
    setExpense(Array.isArray(items) ? items : []);

    setIsMounted(true);
  }, []);

  // saving expense list in localStorage
  useEffect(() => {
    if (expense.length > 0 || isMounted) {
      localStorage.setItem("expenses", JSON.stringify(expense));
    }

    // if (expense.length > 0) {
    //   setExpense(
    //     expense.reduce(
    //       (accumulator, currentValue) =>
    //         accumulator + Number(currentValue.price),
    //       0
    //     )
    //   );
    // } else {
    //   setExpense(0);
    // }

    let foodSpends = 0,
      entertainmentSpends = 0,
      travelSpends = 0;
    let foodCount = 0,
      entertainmentCount = 0,
      travelCount = 0;

    expense.forEach((item) => {
      if (item.category === "food") {
        foodSpends += Number(item.price);
        foodCount++;
      } else if (item.category === "entertainment") {
        entertainmentSpends += Number(item.price);
        entertainmentCount++;
      } else if (item.category === "travel") {
        travelSpends += Number(item.price);
        travelCount++;
      }
    });

    setCategorySpends({
      food: foodSpends,
      travel: travelSpends,
      entertainment: entertainmentSpends,
    });

    setCategoryCount({
      food: foodCount,
      travel: travelCount,
      entertainment: entertainmentCount,
    });
  }, [expense,isMounted]);

  // saving balance in localStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("balance", balance);
    }
  }, [balance,isMounted]);


  return (
  <div>
    <div className="Whole-Container">
          <h1>Expense Tracker</h1>
    <div className="Container">
    <div className="Wallet-Container">
        <div className="Wallet-Balance">
            <h2>Wallet Balance: <span>₹{balance}</span></h2>
        </div>
        <button type="button" className="Wallet-Button" onClick={()=>setIncomeModal(true)}>+ Add Income</button>
           <Modal className="modal-backdrop" show={IncomeModal} onClose={() => setIncomeModal(false)}>
         <div className="Add-Income-Modal">
              <h2>Add Balance</h2>

        <form onSubmit={handleIncomeSubmit}>
         
          <input type="number" name="amount" className="amount"placeholder="Income Amount"  value={formData.amount}
          onChange={handleChange} />

           {errors.amount && <p className="error">{errors.amount}</p>}

        <button type="submit"className="Add">Add Balance</button>
          <button type="button" className="cancel"onClick={handleCancel}>Cancel</button>

        </form>
        </div>   
      
      </Modal>
     
    </div>
    <div className="Expense-Container">
        <div className="Expense-Balance">
            <h2>Expenses: <span>₹{totalExpense}</span></h2>
        </div>
        <button type="button" className="Expense-Button" onClick={() => setShowModal(true)}>+ Add Expense</button>
         <Modal className="modal-backdrop" show={showModal} onClose={() => setShowModal(false)}>
         <div className="Add-Expense-Modal">
              {/* <h2>Add Expenses</h2> */}
              <h2>{editId ? "Edit Expense" : "Add Expense"}</h2>


        <form onSubmit={editId ? handleUpdateExpense : handleAddExpense}>

         
          <input type="text" name="title" className="title"placeholder="Title"  value={formData.title}
          onChange={handleChange} />

           {errors.title && <p className="error">{errors.title}</p>}

          
          <input type="number" className="price"name ="price"placeholder="Price"    value={formData.price}
          onChange={handleChange}/>

          {errors.price && <p className="error">{errors.price}</p>}

         
           <select
           className="category"
        
        name="category"
         value={formData.category}
          onChange={handleChange}
      >
        <option value="">Select Category</option>
        <option value="food">Food</option>
        <option value="travel">Travel</option>
        <option value="entertainment">Entertainment</option>
      
      </select>
      {errors.category && <p className="error">{errors.category}</p>}
       <input
        type="date"
        name="date"
        className="date"
         value={formData.date}
        onChange={handleChange}
      />
      {errors.date && <p className="error">{errors.date}</p>}
       {/* <button type="submit"className="Add" >Add Expense</button> */}
       <button type="submit" className="Add">
  {editId ? "Edit Expense" : "Add Expense"}
</button>

          <button type="button" className="cancel"onClick={handleCancel}>Cancel</button>

        </form>
        </div>   
      
      </Modal>
    </div>
   <PieChart
          data={data}
        />
    </div>
    <div className="Main-Container">
       <div className="Second-Container">
<h4>Recent Transactions</h4>

<div>
  


{expense.length === 0 ? (
  <input
    placeholder="No Transactions!"
    className="input"
    disabled
  />
) : (
  expense.map((item) => (
    <form
      key={item.id}
      className="transaction-card"
      onSubmit={(e) => {
        e.preventDefault();
        // handle update here
      }}
    >

      {/* LEFT ICON */}
      <div className="transaction-icon">
        <img
    src={categoryIcons[item.category]}
    alt={item.category}
  />
      </div>

      {/* TITLE + DATE */}
      <div className="transaction-info">
        <p className="transaction-title">{item.title}</p>
  <span className="transaction-date">{item.date}</span>
      </div>

      {/* AMOUNT */}
      <div className="transaction-amount">
               <p>₹{item.amount}</p>

      </div>

      {/* ACTION BUTTONS */}
      <div className="transaction-actions">
        <button
          type="button"
          className="delete-btn"
          onClick={() => handleDelete(item.id)}
        >
          ❌
        </button>

        <button
          type="button"
          className="edit-btn"
          onClick={()=> handleEdit(item)}
        >
          ✏️
        </button>
      </div>

    </form>
  ))
)}
</div>
</div>

    <div >
        <h4 className="Top">Top Expenses</h4>
        <div className="Third-Container">
  {barData.length === 0 ? (
    <div>
   <p>         Food-</p>
   <p>Entertainment-</p>
   <p>Travel-</p>
</div>

  ) : (
    barData.map((item) => (
      <div key={item.name} className="bar-row">
        <span className="label">{item.name}</span>

        <div className="bar-wrapper">
          <div
            className="bar-fill"
            style={{
              // width: `${item.value}px`
              width: `${(item.value / maxBarValue) * 100}%`

            }}
          ></div>
        </div>

        <span className="amount">₹{item.value}</span>
      </div>
    ))
  )}
</div>

    </div>

    </div>

    </div>
   
    </div>
   
       
  
  );
}

export default Wallet;
