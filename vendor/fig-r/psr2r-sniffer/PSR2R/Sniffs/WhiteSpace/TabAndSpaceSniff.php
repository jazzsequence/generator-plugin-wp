<?php
/**
 * PHP Version 5
 *
 * CakePHP(tm) : Rapid Development Framework (http://cakephp.org)
 * Copyright (c) Cake Software Foundation, Inc. (http://cakefoundation.org)
 *
 * Licensed under The MIT License
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Cake Software Foundation, Inc. (http://cakefoundation.org)
 * @link          http://pear.php.net/package/PHP_CodeSniffer_CakePHP
 * @since         CakePHP CodeSniffer 0.1.11
 * @license       http://www.opensource.org/licenses/mit-license.php MIT License
 */

namespace PSR2R\Sniffs\WhiteSpace;

use PHP_CodeSniffer_File;

/**
 * Check for any line starting with 2 spaces - which would indicate space indenting
 * Also check for "\t " - a tab followed by a space, which is a common similar mistake
 */
class TabAndSpaceSniff implements \PHP_CodeSniffer_Sniff {

	/**
	 * A list of tokenizers this sniff supports.
	 *
	 * @var array
	 */
	public $supportedTokenizers = [
		'PHP',
		'JS',
		'CSS'
	];

	/**
	 * @inheritDoc
	 */
	public function register() {
		return [T_WHITESPACE];
	}

	/**
	 * @inheritDoc
	 */
	public function process(PHP_CodeSniffer_File $phpcsFile, $stackPtr) {
		$tokens = $phpcsFile->getTokens();

		$line = $tokens[$stackPtr]['line'];
		if ($stackPtr > 0 && $tokens[($stackPtr - 1)]['line'] !== $line) {
			return;
		}

		if (strpos($tokens[$stackPtr]['content'], '  ') !== false) {
			$error = 'Double space found';
			$fix = $phpcsFile->addFixableError($error, $stackPtr);
			if ($fix) {
				$phpcsFile->fixer->replaceToken($stackPtr, ' ');
			}
		}
		if (strpos($tokens[$stackPtr]['content'], " \t") !== false) {
			$error = 'Space and tab found';
			$fix = $phpcsFile->addFixableError($error, $stackPtr);
			if ($fix) {
				$phpcsFile->fixer->replaceToken($stackPtr, ' ');
			}
		}
		if (strpos($tokens[$stackPtr]['content'], "\t ") !== false) {
			$error = 'Tab and space found';
			$fix = $phpcsFile->addFixableError($error, $stackPtr);
			if ($fix) {
				$phpcsFile->fixer->replaceToken($stackPtr, ' ');
			}
		}
	}

}
