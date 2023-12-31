const moment = require('moment');
const Sale = require('../models/orderModel')
const Order = require('../models/orderModel')
const hbs = require('hbs')
const ejs = require("ejs");
const pdf = require("html-pdf");
const fs = require("fs");
const path = require("path");
// const { response } = require("../app");
const jsPdf = require("jspdf")
const PDFDocument = require('pdfkit');


let months = []
let odersByMonth = []
let revnueByMonth = []
let totalRevnue = 0
let totalSales = 0

hbs.registerHelper("json", function (context) {
    return JSON.stringify(context)
})

const loadDashboard = async (req, res) => {

    const sales  = await Sale.find()


    const salesByMonth = {};

    sales.forEach((sale) => {
        const monthYear = moment(sale.date).format('MMMM YYYY');
        if (!salesByMonth[monthYear]) {
            salesByMonth[monthYear] = {
                totalOrders: 0,
                totalRevenue: 0
            };
        }
        salesByMonth[monthYear].totalOrders += 1;
        salesByMonth[monthYear].totalRevenue += sale.total;
    });

    const chartData = [];

    Object.keys(salesByMonth).forEach((monthYear) => {
        const { totalOrders, totalRevenue } = salesByMonth[monthYear];
        chartData.push({
            month: monthYear.split(' ')[0],
            totalOrders: totalOrders || 0,
            totalRevenue: totalRevenue || 0
        });
    });


    months = []
    odersByMonth = []
    revnueByMonth = []
    totalRevnue = 0
    totalSales = 0



    chartData.forEach((data) => {
        months.push(data.month)
        odersByMonth.push(data.totalOrders)
        revnueByMonth.push(data.totalRevenue)
        totalRevnue += Number(data.totalRevenue)
        totalSales += Number(data.totalOrders)
    })

    const thisMonthOrder = odersByMonth[odersByMonth.length - 1]
    const thisMonthSales = revnueByMonth[revnueByMonth.length - 1]



    res.render('adminhome', { 
        revnueByMonth,
        months, 
        odersByMonth, 
        totalRevnue, 
        totalSales,
        thisMonthOrder, 
        thisMonthSales })



}

const getSales = async (req, res) => {
    const { stDate, edDate } = req.query
    console.log(stDate, edDate)

    const startDate = new Date(stDate);
    const endDate = new Date(edDate);

    const orders = await Order.find({
        date: {
            $gte: startDate,
            $lte: endDate,
        },
        status: 'Delivered' // Filter by status
    })
        .sort({ date: 'desc' });

    const formattedOrders = orders.map((order) => ({
        date: moment(order.date).format('YYYY-MM-DD'),
        ...order
    }))

    console.log(formattedOrders);

    let salesData = []

    formattedOrders.forEach((element) => {
        salesData.push({
            date: element.date,
            orderId: element._doc.orderId,
            total: element._doc.total,
            payMethod: element._doc.paymentMethod,
            proName: element._doc.product,
        })
    })


    let grandTotal = 0

    salesData.forEach(element => {
        grandTotal += element.total
    })

    console.log(grandTotal);

    res.json({
        grandTotal: grandTotal,
        orders: salesData,
    });


}

const getChartData = (req, res) => {


    try {
        res.json({
            months: months,
            revnueByMonth: revnueByMonth,
            odersByMonth: odersByMonth
        })
    } catch (error) {

    }
}

const exportPdfDailySales = async (req, res) => {
    try {

        const today = new Date().toISOString().split('T')[0];

        const todaysOrders = await Order.aggregate([
            {
                $match: {
                    orderDate: {
                        $gte: new Date(today),
                        $lt: new Date(today + 'T23:59:59.999Z')
                    }
                }
            }, {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            }, {
                $unwind: '$user'
            }, {
                $lookup: {
                    from: "products",
                    localField: "item.product",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
        ]);

        const orderData = {
            todaysOrders: todaysOrders
        }

        const filePathName = path.resolve(__dirname, "../view/admin/htmlToPdf.ejs")
        const htmlString = fs.readFileSync(filePathName).toString();

        const ejsData = ejs.render(htmlString, orderData)

        await createDailySalesPdf(ejsData);

        const pdfFilePath = 'DailySalesReport.pdf';
        const pdfData = fs.readFileSync(pdfFilePath);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="DailySalesReport.pdf"');

        res.send(pdfData);

    } catch (error) {
        console.log(error.message);
    }
};

const createDailySalesPdf = async (html) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    await page.pdf({ path: 'DailySalesReport.pdf' });
    await browser.close();
};

const loadOrderPdf = async (req, res)=>{
    try {
        res.render('orderPdf')
    } catch (error) {
        console.log(error.message)
    }
}

let monthlyorderdata
const getOrders = async(req,res)=>{

    console.log("inside th getOrdertr");
    try {
        const fromdate = req.body.fromDate
        const toDate = req.body.toDate

        monthlyorderdata = await Order.find({
            date: { $gte: fromdate, $lte: toDate }
          })
            .populate('userId')
            .populate('product.id')
            .sort({ date: -1 });
          
        res.json({ orderdata: monthlyorderdata })
        // console.log('monthly order data')
        // console.log(monthlyorderdata[0])
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    loadDashboard,
    getSales,
    getChartData,
    exportPdfDailySales,
    loadOrderPdf,
    getOrders
}