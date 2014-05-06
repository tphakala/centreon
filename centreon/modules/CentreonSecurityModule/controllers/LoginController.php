<?php
/*
 * Copyright 2005-2014 MERETHIS
 * Centreon is developped by : Julien Mathis and Romain Le Merlus under
 * GPL Licence 2.0.
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation ; either version 2 of the License.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program; if not, see <http://www.gnu.org/licenses>.
 *
 * Linking this program statically or dynamically with other modules is making a
 * combined work based on this program. Thus, the terms and conditions of the GNU
 * General Public License cover the whole combination.
 *
 * As a special exception, the copyright holders of this program give MERETHIS
 * permission to link this program with independent modules to produce an executable,
 * regardless of the license terms of these independent modules, and to copy and
 * distribute the resulting executable under terms of MERETHIS choice, provided that
 * MERETHIS also meet, for each linked independent module, the terms  and conditions
 * of the license of that module. An independent module is a module which is not
 * derived from this program. If you modify this program, you may extend this
 * exception to your version of the program, but you are not obliged to do so. If you
 * do not wish to do so, delete this exception statement from your version.
 *
 * For more information : contact@centreon.com
 *
 */
namespace CentreonSecurity\Controllers;

/**
 * Login controller
 * @authors Maximilien Bersoult
 * @package Centreon
 * @subpackage Controllers
 */
class LoginController extends \Centreon\Internal\Controller
{
    /**
     * Action for login page
     *
     * @method GET
     * @route /login
     */
    public function loginAction()
    {
        $di = \Centreon\Internal\Di::getDefault();
        $router = $di->get('router');
        $redirectUrl = $router->request()->param(
            'redirect',
            str_replace('/login', '/home', $router->request()->uri())
        );
        $tmpl = $di->get('template');
        
        $tmpl->assign('csrf', \Centreon\Internal\Form::getSecurityToken());
        $tmpl->assign('redirect', $redirectUrl);
        $tmpl->display('file:[CentreonSecurityModule]login.tpl');
    }

    /**
     * Action ajax for login
     *
     * @method POST
     * @route /login
     */
    public function loginPostAction()
    {
        $di = \Centreon\Internal\Di::getDefault();
        $router = $di->get('router');
        $username = $router->request()->param('login');
        $password = $router->request()->param('passwd');
        $csrf = $router->request()->param('csrf');
        /* Validate CSRF */
        try {
            \Centreon\Internal\Form::validateSecurity($csrf);
        } catch (\Exception $e) {
            $router->response()->json(
                array(
                    'status' => false,
                    'error' => _("Security key does not match.")
                )
            );
            return;
        }
        $auth = new \Centreon\Internal\Auth\Sso($username, $password, 0);
        if (1 === $auth->passwdOk) {
            $user = new \Centreon\Internal\User();
            $user->init($auth->userInfos['contact_id']);
            $_SESSION['user'] = $user;
            \Centreon\Internal\Session::init($user->getId());
            $_SESSION['acl'] = new \Centreon\Internal\Acl($user);
            $router->response()->json(
                array(
                    'status' => true
                )
            );
            return;
        }
        $router->response()->json(
            array(
                'status' => false,
                'error' => _("Authentication failed.")
            )
        );
    }

    /**
     * Logout the user
     *
     * @method GET
     * @route /logout
     */
    public function logoutAction()
    {
        //        session_regenerate_id(true);
        session_destroy();
        \Centreon\Internal\Di::getDefault()
            ->get('router')
            ->response()->json(
                array(
                    'status' => true
                )
            );
    }
}
