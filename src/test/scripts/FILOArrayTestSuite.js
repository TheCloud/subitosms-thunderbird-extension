function FILOArrayTestSuite() {
}

FILOArrayTestSuite.prototype.testNewArrayIsEmpty = function testNewArrayIsEmpty() {
    var l = new funambol.subitosms.util.FILOArray();

    assertTrue(l.isEmpty());
}

FILOArrayTestSuite.prototype.testDefaultMaxSize = function testDefaultMaxSize() {
    var l = new funambol.subitosms.util.FILOArray();

    assertEquals(20, l.getMaxSize());
}

FILOArrayTestSuite.prototype.testGivenMaxSize = function testGivenMaxSize() {
    var l = new funambol.subitosms.util.FILOArray(10);

    assertEquals(10, l.getMaxSize());
}

FILOArrayTestSuite.prototype.testGetBoundaries = function testGetBoundaries() {
    var l = new funambol.subitosms.util.FILOArray(5);

    var success = true;
    var failMessage = "";
    try {
        l.get(-1);
        success = false;
        failMessage = "Index < 0 should result in an error.";
    } catch (e) {
        println(e.description);
    }

    if (!success) {
        fail(failMessage);
    }

    try {
        l.get(0);
        success = false;
        failMessage = "Index > array size should result in an error.";
    } catch (e) {
        println(e.description);
    }

    if (!success) {
        fail(failMessage);
    }
}

FILOArrayTestSuite.prototype.testAddWithinMaxSize = function testAddWithinMaxSize() {
    var l = new funambol.subitosms.util.FILOArray(5);
    
    l.add(t1 = "+11111111");
    l.add(t2 = "+22222222");
    l.add(t3 = "+33333333");

    assertEquals(3, l.getSize());
    assertEquals(t3, l.get(0));
    assertEquals(t2, l.get(1));
    assertEquals(t1, l.get(2));
}

FILOArrayTestSuite.prototype.testAddOverMaxSize = function testAddOverMaxSize() {
    var l = new funambol.subitosms.util.FILOArray(3);

    l.add(t1 = "+11111111");
    l.add(t2 = "+22222222");
    l.add(t3 = "+33333333");
    l.add(t4 = "+44444444");

    assertEquals(3, l.getSize());
    assertEquals(t4, l.get(0));
    assertEquals(t3, l.get(1));
    assertEquals(t2, l.get(2));
}

FILOArrayTestSuite.prototype.testAddDuplicateNumber = function testAddDuplicateNumber() {
    var l = new funambol.subitosms.util.FILOArray();

    l.add(t1 = "+11111111");
    l.add(t2 = "+11111111");

    assertEquals(1, l.getSize());
}

FILOArrayTestSuite.prototype.testToString = function testToString() {
    var l = new funambol.subitosms.util.FILOArray(3);

    assertEquals("", l.toString());

    l.add(t1 = "+11111111");
    assertEquals(t1, l.toString());

    l.add(t2 = "+22222222");
    assertEquals(t2+","+t1, l.toString());
}

FILOArrayTestSuite.prototype.testFromString = function testFromString() {
    var l = new funambol.subitosms.util.FILOArray(3);

    l.fromString("");
    assertTrue(l.isEmpty());

    l.fromString(t1 = "+11111111");
    assertEquals(1, l.getSize());
    assertEquals(t1, l.get(0));

    t2 = "+22222222";
    l.fromString(t1 + "," + t2);
    assertEquals(2, l.getSize());
    assertEquals(t1, l.get(0));
}