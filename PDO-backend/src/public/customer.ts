
export const template = `
<style>
    body {
        background-color: powderblue;
    }

    h1 {
        color: blue;
    }

    p {
        color: brown;
    }

    #container1 {
        min-height: 200px;
        margin: 0;
        padding: 10px;
        border: 2px solid red;
    }

    .container {
        display: flex;
        flex-direction: row;
        flex-flow: row wrap
    }
</style>
<section class="container">
 <div style="margin: 10px; margin-left: 40px;"><img src="image/halloumi.png" style= "max-height:150px"></div>
 <div style="flex-grow: 2">
<p style="margin:20px;"><strong><span style="color: brown; font-size: clamp(2rem,1vw,4rem);">HALLOUMI traceability info</span></strong></p>
<p style="margin:20px;"><strong><span style="font-size: 18px; font-size: clamp(2rem,1vw,3rem); color: rgb(243, 121, 52);">Cyprus Ministry of Agriculture</span></strong></p>
</div>
</section>
<hr>

    
        <ul>
            <li><span style="font-size: 16px;">Produced by : &nbsp; &nbsp; &nbsp; &nbsp;{{halloumiProduced.fromName}}</span></li>
            <li>Batch Id: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; {{batchId}}</li>
            <li>Production Date: &nbsp; {{halloumiProduced.eventDetails.production_date}}</li>
            <li>Expiry Date: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;{{halloumiProduced.eventDetails.expiry_date}}</li>
            <li>Milk proportions: &nbsp;{{halloumiProduced.eventDetails.milk_proportions}}</li>
            <li>License status: <span style="color: rgb(97, 189, 109);">&nbsp; &nbsp; &nbsp; {{halloumiProduced.licenseStatus}}</span></li>
        </ul>
    
   

<hr>
<p>&nbsp; &nbsp; &nbsp; <strong><span style="font-size: 18px;">Supply chain actors</span></strong></p>

<p style="text-align: justify; margin-left: 40px;"><strong><span style="font-size: 18px;"> </span><span style="font-size: 16px;">Milk producer</span></strong></p>
<ul style="margin-left: 40px ;">
    <li style="text-align: justify;"><span style="font-size: 16px;">Produced by: {{milkProduced.fromName}}</span></li>
    <li style="text-align: justify;"><span style="font-size: 16px;">Production Date: {{milkProduced.eventDetails.milk_production_date}}</span></li>
    <li style="text-align: justify;"><span style="font-size: 16px;">Milk type: {{milkProduced.eventDetails.milk_type}}</span></li>
    <li style="text-align: justify;"><span style="font-size: 16px;">Milk volume: {{milkProduced.eventDetails.milk_volume}}</span></li>
    <li style="text-align: justify;"><span style="font-size: 16px;">License status: <span style="color: rgb(97, 189, 109);">{{milkProduced.licenseStatus}}</span></span></li>
</ul>

<p style="text-align: justify; margin-left: 40px;"><strong><span style="font-size: 16px;">Mint producer</span></strong></p>
<ul style="margin-left: 40px ;">
    <li style="text-align: justify;"><span style="font-size: 16px;">Produced by: {{mintProduced.fromName}}</span></li>
    <li style="text-align: justify;"><span style="font-size: 16px;">Production Date: {{mintProduced.eventDetails.mint_production_date}}</span></li>
  
    <li style="text-align: justify;"><span style="font-size: 16px;">Mint volume: {{mintProduced.eventDetails.mint_volume}}</span></li>
    <li style="text-align: justify;"><span style="font-size: 16px;">License status: <span style="color: rgb(97, 189, 109);">{{mintProduced.licenseStatus}}</span></span></li>
</ul>

<p style="text-align: justify; margin-left: 40px;"><strong><span style="font-size: 16px;">Milk transporter</span></strong></p>
<ul style="margin-left: 40px ;">
    <li style="text-align: justify;"><span style="font-size: 16px;">Delivered by: {{milkTransported.fromName}}</span></li>
    <li style="text-align: justify;"><span style="font-size: 16px;">Delivery Date: {{milkTransported.eventDetails.milk_delivery_date}}</span></li>
    <li style="text-align: justify;"><span style="font-size: 16px;">Refrigerator temp: {{milkTransported.eventDetails.refrigerator_temperature}}</span></li>
    <li style="text-align: justify;"><span style="font-size: 16px;">Milk volume: {{milkTransported.eventDetails.milk_volume}}</span></li>
    <li style="text-align: justify;"><span style="font-size: 16px;">License status: <span style="color: rgb(97, 189, 109);">{{milkTransported.licenseStatus}}</span></span></li>
</ul>

<p style="text-align: justify; margin-left: 40px;"><strong><span style="font-size: 16px;">Mint transporter</span></strong></p>
<ul style="margin-left: 40px ;">
    <li style="text-align: justify;"><span style="font-size: 16px;">Delivered by: {{mintTransported.fromName}}</span></li>
    <li style="text-align: justify;"><span style="font-size: 16px;">Delivery Date: {{mintTransported.eventDetails.mint_delivery_date}}</span></li>

    <li style="text-align: justify;"><span style="font-size: 16px;">Mint weight: {{mintTransported.eventDetails.mint_weight}}</span></li>
    <li style="text-align: justify;"><span style="font-size: 16px;">License status: <span style="color: rgb(97, 189, 109);">{{mintTransported.licenseStatus}}</span></span></li>
</ul>

<p><br></p>
<hr>
<p><span style="font-size: 12px;"><em>&nbsp; &nbsp; &nbsp; EBSI TnT document: &nbsp;</em></span><span style="color: #ce9178;"><a href="https://api-pilot.ebsi.eu/track-and-trace/v1/documents/{{documentId}}">get it</a><span style="font-size: 12px;"><em>&nbsp;</em></span></span></p>
<p><span style="font-size: 12px;"><em>&nbsp; &nbsp; &nbsp; EBSI TnT events: &nbsp;</em></span><span style="color: #ce9178;"><a href="events?documentId={{documentId}}">get them</a><span style="font-size: 12px;"><em>&nbsp;</em></span></span></p>
<p>
<span style="color: brown;"><span style="font-size: 12px;"><em>all licenses have been issued by the Cyprus Ministry of Agriculture</em></span></span></p>

`