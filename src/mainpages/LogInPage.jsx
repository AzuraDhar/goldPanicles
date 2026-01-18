import React from "react";

import { MdOutlineEmail } from "react-icons/md";
import { IoLockClosedOutline } from "react-icons/io5";
import { LuLogIn } from "react-icons/lu";

import './LogInPage.css';


function LogInPage(){

    return(

            <div className="login_mainbody">

                        <div className="login_container">

                            <div className="column1"></div>


                            <div className="column2">

                                    <div className="logform">

                                        <div className="form_title">


                                        </div>

                                        <form>

                                            <p><i>"We never flinch in serving you the truth"</i></p>

                                            <div class="input-group input-group-sm mb-3 mt-4">
                                                <span className="input-group-text" id="inputGroup-sizing-sm">
                                                        <span className="icon me-3">
                                                            <MdOutlineEmail />
                                                        </span>
                                                            Email
                                                    </span>
                                                <input type="text" className="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm"/>
                                            </div>

                                            <div class="input-group input-group-sm mb-3">
                                                <span className="input-group-text" id="inputGroup-sizing-sm">
                                                        <span className="icon me-2">
                                                            <IoLockClosedOutline />
                                                        </span>
                                                            Password
                                                    </span>
                                                <input type="password" className="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm"/>
                                            </div>

                                            <button type="button" className="btn mt-3">
                                                <span className="icon me-2">
                                                    <span className="icon_log me-2">
                                                    <LuLogIn className="icon-adjust" />
                                                    </span>
                                                    LOGIN
                                                </span>
                                            </button>

                                        </form>

                                        <p className="sign_fontsize mt-2">Don't have an Account ? <a href="#">Sign Up</a></p>
                                    </div>

                            </div>

                        </div>

            </div>

    )

}

export default LogInPage;