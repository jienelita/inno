<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>{{$load_code}} PDF</title>
    <style>
        body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px;
            line-height: 1.6;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .bold {
            font-weight: bold;
        }

        .underline {
            text-decoration: underline;
        }

        .section {
            margin-bottom: 20px;
        }

        .signature {
            height: 60px;
        }

        .photo {
            width: 100px;
            height: auto;
        }

        .released-box {
            border: 2px dashed red;
            padding: 10px;
            text-align: center;
            margin-top: 20px;
        }

        .released-text {
            color: green;
            font-weight: bold;
            font-size: 18px;
        }

        .footer {
            text-align: center;
            color: green;
            font-weight: bold;
            margin-top: 30px;
        }

        .texthead {
            font-weight: bold
        }
    </style>
</head>

<body>

    <div class="text-center">
        <div class="texthead">MARAGUSAN GROWERS MULTIPURPOSE COOPERATIVE</div>
        Rizal Street Poblacion, Maragusan (San Mariano), Davao del Norte
        <hr />
        <div style="color: green; font-size: 28px; font-weight: bold">{{$load_code}}</div>
    </div>
    <div style="font-size: 11px;">
        <div class="section">
            <div style="float: left">
                <p><strong>Date:</strong> <u><b>{{ date('Y-m-d') }}</b></u><br />
                <strong>The Manager</strong><br></p>
                <p>
                    MARAGUSAN GROWERS MULTIPURPOSE COOPERATIVE<br>
                    Rizal Street Poblacion, Maragusan (San Mariano), Davao del Norte</p>
            </div>
            <div style="float: right">
                <img src="{{ public_path('images/'.$photo) }}" class="photo" />
            </div>
            <div style="clear:both"></div>
            <p>Madam/Sir:</p>

            <div style="text-indent: 20px">
                I desire to apply for a/an <span class="underline bold">{{$load_code}}</span> loan of
                <strong>{{ $loanAmountWords }} (P {{ number_format($loanAmount, 2) }})</strong>
                with a term of <strong>{{ $term }} months</strong> and
                <strong>{{ $days ?? 0 }} day</strong> (days/months) payable in
                <strong>{{ date('d M Y', strtotime($payable) ) }}</strong> installment basis.
            </div>

            <div style="text-indent: 20px">
                I will offer the following as collateral for this loan:
                Savings Deposit <strong>{{ number_format($savings, 2) }}</strong>,
                Share Capital <strong>{{ number_format($capital, 2) }}</strong>. Others {{ $others }}.
            </div>

            <div style="clear:both"></div>
            <div style=" margin-top:20px; postion: relative;">
                <img src="{{ public_path('images/' . $signature . '') }}" class="photo"
                    style="position: absolute; margin-top: -30px; width: 320px; right: 0px " />
                <div style="float: right;" class="text-center">
                    <strong class="underline">{{ $name }}</strong><br>
                    Applicant’s Printed Name & Signature<br>
                    Tel. #/Cell #: <u>{{ $contact }}</u>
                </div>
            </div>
            <div style="clear:both"></div>
        </div>


        <div class="section">
            <div class="text-center">
                <div style="font-size: 14px; font-weight: bold">PROMISSORY NOTE</div>
                <strong style="color:red">HO NO. {{ $loanCode }}</strong>
            </div>

            <div style="float: left;"><strong>Amount of Loan:</strong> P {{ number_format($loanAmount, 2) }}</div>
            <div style="float: right"><strong>Date:</strong> {{ date('Y-m-d') }}</div>
            <div style="clear: both"></div>
            <div style="text-indent: 20px; margin-top:20px">For value received, I promised to pay to <b><u>MARAGUSAN GROWERS MULTIPURPOSE COOPERATIVE</u></b>
                , or its order, on or before <u>{{ date('d M Y', strtotime($payable) ) }}</u> the sum of four thousand Pesos (<u>P {{ number_format($loanAmount, 2) }}</u> ), with interest at the rate of ( <u>{{ $interestRate }} %</u> ) per
                (month/annum), computed based (diminishing balance).</div>
            <div style="text-indent: 20px">A PENALTY at the rate of two percent (2.0%) per month will be charge on all
                delayed
                or unpaid instsallment. The
                cooperative is authorized to off-set or apply any deposit in the cooperative in borrower's name account
                to
                the
                payment of the loan without need for prior notice or approval from the member-borrower.</div>
            <div style="text-indent: 20px">My/Our failure to promptly and fully pay any installment on the amortization or
                due
                date shall render the
                entire amount oustanding under this note, without need for any notice, demand or presentment, the right
                of
                all of
                which is hereby waived by me/us: (i) immediately due, payable and defaulted. In such an event, the
                holder
                shall
                likewise have the right to proceed against any valuable personal property of the makers.</div>
            <div style="text-indent: 20px">In case of Court action on the Promissory Note, or on the transaction which
                gave
                rise to its execution, venue
                of such action is fixed to be in the Rizal Stree Poblacion, Maragusan (San Mariano), Davao del Norte
                where
                the
                principal office of <b>MARAGUSAN GROWERS MULTIPURPOSE COOPERATIVE</b> is situated.</div>
            <div style="text-indent: 20px">Known to me and to me known to be the same person who executed the foregoing
                PROMISSORY NOTE, including its
                annexe/s and acknowledged to me that the same is their free and voluntary act and deed. This instrument
                has
                been
                signed by the concerned parties and their witnesses, and sealed with my notarial seal.</div>
            <div>WITNESS MY HAND AND SEAL, this_____________at____________.</div>

        </div>

        <div class="section">
            <div style="float: left; width: 280px">
                Doc. No. _______<br>
                Page No. _______<br>
                Book No. _______<br>
                Series of {{ date('Y') }}
            </div>
            <div style="float: left;">
                Notary Public
            </div>
        </div>
        <div style="clear: both"></div>

        <div style="width: 30%;  float: left;">
            <p>Signed in the presence of:</p>
            <p>______________________________<br>
                Signature Over Printed Name<br>
                Witness</p>
        </div>

        <div class="released-box" style="width: 30%; border-radius: 10px; float: left; margin-left: 2% ">
            <div style="color: red;">LOAN RELEASED</div>
            <p>Date Released: {{ date('Y') }}<br>
                Initial by: _______</p>
        </div>

        <div style=" position: relative">
            <img src="{{ public_path('images/' . $signature . '') }}" class="photo"
                style="position: absolute; margin-top: -50px; width: 320px; left: 55% " />

            <div class="text-center" style="width: 30%;  float: right;">
                <strong>{{ $name }}</strong><br>
                <small>Printed Name & Signature</small>
                <div style="margin-top: 20px;">
                    _____________________________________<br>
                    HRMA SPECIALIST/H.O. LOAN PROCESSOR<br>
                    <small>on mobile app</small>
                </div>
            </div>
        </div>
    </div>
    <div style="clear: both"></div>
    <div class="footer">
       <div style="font-size: 16px">I GROW WITH MAGROW!</div>
     </div>
     <div class="text-center">
        <small>All rights reserved © {{ date('Y') }}</small>
    </div>

</body>

</html>
