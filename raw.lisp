
(defun our-length (lst)
  (let ((len 0) (test '(1 2 3)) (lam #'+) (laml #'(car (+ *))))
    (dolist (obj lst)
      (setf len (+ len 1)))
    len))